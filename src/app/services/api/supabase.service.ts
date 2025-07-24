import { Injectable } from '@angular/core';
import { supabase } from './supabase-client.service'

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  constructor() { }

  async getAllUsers() {
    return await supabase.from('users').select('*');
  }

  async verifyUser({ fullname }: any) {
    return await supabase
      .from('users')
      .select('*')
      .ilike('fullname', fullname.trim());
  }


}
