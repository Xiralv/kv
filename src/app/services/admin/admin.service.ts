import { Injectable } from '@angular/core';
import { supabase } from '../api/supabase-client.service'

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