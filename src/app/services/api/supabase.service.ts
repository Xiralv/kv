import { Injectable } from '@angular/core';
import { supabase } from './supabase-client.service'

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor() { }

  async getAllUsers() {
    return await supabase.from('guests').select('*');
  }



  async verifyUser({ fullname }: any) {
    return await supabase
      .from('guests')
      .select('*')
      .ilike('full_name', fullname.trim());
  }



  async getGuestWithRelations(fullname: string) {
    // 1. Get the guest_id of the person by name
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, full_name, attend')
      .ilike('full_name', fullname.trim())
      .single();

    if (guestError) throw guestError;
    if (!guest) throw new Error('Guest not found');

    // 2. Get all related guests
    const { data: relations, error: relationError } = await supabase
      .from('guest_relations')
      .select(`
      related_guest_id,
      guests!guest_relations_related_guest_id_fkey (
        id,
        full_name,
        attend
      )
    `)
      .eq('guest_id', guest.id);

    if (relationError) throw relationError;

    // 3. Merge: guest + their relations
    const relatedGuests = relations.map(r => r.guests);
    return [guest, ...relatedGuests];
  }


  async updateAttend(guestId: string, attend: boolean) {
  const { data, error } = await supabase
    .from('guests')
    .update({ attend })
    .eq('id', guestId)
    .select(); // returns updated row

  if (error) throw error;
  return data;
}

}
