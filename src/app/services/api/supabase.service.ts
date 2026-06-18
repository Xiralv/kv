import { Injectable } from '@angular/core';
import { supabase } from './supabase-client.service'

export interface Guest {
  id: string;
  full_name: string;
  attend: boolean | null;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor() { }

  /**
   * Looks up a guest by name and returns their full RSVP party (the guest
   * plus everyone linked to them via guest_relations).
   *
   * This now calls the verify_guest_party() RPC instead of querying the
   * `guests` table directly — the table itself has RLS enabled with no
   * policies, so direct .from('guests').select() calls from the browser
   * return nothing. All reads go through this SECURITY DEFINER function.
   */
  async verifyUser({ fullname }: { fullname: string }) {
    return await supabase.rpc('verify_guest_party', { p_fullname: fullname.trim() });
  }

  /**
   * Same lookup as verifyUser, but throws on a miss instead of returning
   * an empty array — used by the "View My RSVP" auto-load path and by
   * onSubmit() once a name has been typed.
   */
  async getGuestWithRelations(fullname: string): Promise<Guest[]> {
    const { data, error } = await supabase.rpc('verify_guest_party', { p_fullname: fullname.trim() });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Guest not found');

    return data as Guest[];
  }

  /**
   * Updates one guest's attendance via the submit_rsvp_response() RPC.
   *
   * fullname is required here (not just guestId) because the function
   * re-derives the caller's RSVP party server-side and only allows the
   * update to go through if guestId actually belongs to that party. This
   * is what stops someone from updating an arbitrary guest id they found
   * or guessed.
   */
  async updateAttend(guestId: string, attend: boolean, fullname: string) {
    const { data, error } = await supabase.rpc('submit_rsvp_response', {
      p_guest_id: guestId,
      p_fullname: fullname.trim(),
      p_attend: attend,
    });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data;
  }
}