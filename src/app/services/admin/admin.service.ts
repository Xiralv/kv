import { Injectable } from '@angular/core';
import { supabase } from '../api/supabase-client.service'
import { Observable, timer, from, EMPTY } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface AdminGuest {
  id: string;
  full_name: string;
  attend: boolean | null;
  table_number: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  updated_at: string;
}

export interface AdminStats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  checked_in: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {

  async getAllGuests(): Promise<AdminGuest[]> {
    const { data, error } = await supabase.rpc('admin_get_all_guests');
    if (error) throw error;
    return (data || []) as AdminGuest[];
  }

  /**
   * Polls admin_get_all_guests on an interval and emits the fresh list each
   * time, so the admin page picks up RSVP/check-in changes made elsewhere
   * (e.g. a guest submitting the public RSVP form) without a manual refresh.
   *
   * This uses polling rather than Supabase Realtime (`postgres_changes`)
   * because the `guests` table has no direct SELECT policy for the `anon`
   * role — it's only reachable through this SECURITY DEFINER RPC, which
   * keeps guest data hidden from anyone poking the API directly. Realtime's
   * postgres_changes feed is filtered by each client's RLS, so an anon
   * subscriber would receive nothing anyway unless that lockdown were
   * relaxed. Polling gets the same "auto-updates" result without loosening
   * that.
   */
  watchGuests(intervalMs = 15000): Observable<AdminGuest[]> {
    return timer(intervalMs, intervalMs).pipe(
      switchMap(() => from(this.getAllGuests()).pipe(
        catchError(err => {
          console.error('watchGuests poll failed', err);
          return EMPTY; // skip this tick, keep polling on the next one
        }),
      )),
    );
  }

  async getStats(): Promise<AdminStats> {
    const { data, error } = await supabase.rpc('admin_get_stats');
    if (error) throw error;
    return data as AdminStats;
  }

  async updateGuest(
    id: string,
    full_name: string,
    attend: boolean | null,
    table_number: string | null,
  ): Promise<void> {
    const { error } = await supabase.rpc('admin_update_guest', {
      p_id: id,
      p_full_name: full_name,
      p_attend: attend,
      p_table_number: table_number,
    });
    if (error) throw error;
  }

  async toggleCheckIn(id: string, checked_in: boolean): Promise<void> {
    const { error } = await supabase.rpc('admin_toggle_checkin', {
      p_id: id,
      p_checked_in: checked_in,
    });
    if (error) throw error;
  }

  async deleteGuest(id: string): Promise<void> {
    const { error } = await supabase.rpc('admin_delete_guest', { p_id: id });
    if (error) throw error;
  }

  async addGuest(full_name: string, table_number: string | null): Promise<string> {
    const { data, error } = await supabase.rpc('admin_add_guest', {
      p_full_name: full_name,
      p_table_number: table_number,
    });
    if (error) throw error;
    return data as string;
  }
}