import { Injectable } from '@angular/core';
import { supabase } from './supabase-client.service'

export interface Guest {
  id: string;
  full_name: string;
  attend: boolean | null;
}

export interface WeddingPhoto {
  id: string;
  url: string;
  uploader_name: string;
  created_at: string;
}

export interface GuestSearchResult {
  id: string;
  full_name: string;
  attend: boolean | null;
}

const PHOTO_BUCKET = 'wedding-photos';
const PHOTO_TABLE = 'photos';

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



  /**
 * Search guests by first name (or partial name).
 * Returns:
 *   0 results → not found
 *   1 result  → unique match, proceed
 *   2+ results → ambiguous, ask for more
 */
  async searchGuestByFirstname(firstname: string): Promise<GuestSearchResult[]> {
    const { data, error } = await supabase.rpc('search_guest_by_firstname', {
      p_firstname: firstname.trim(),
    });
    if (error) throw error;
    return (data || []) as GuestSearchResult[];
  }




  // ─── Photos ────────────────────────────────────────────────────────────────

  /**
   * Server-side check: returns true only if the guest exists in the guests
   * table with attend = true. Runs via a SECURITY DEFINER RPC so the guests
   * table is never directly exposed to the browser.
   */
  async isConfirmedGuest(fullname: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_confirmed_guest', {
      p_fullname: fullname.trim(),
    });
    if (error) {
      console.error('isConfirmedGuest error:', error);
      return false;
    }
    return data === true;
  }

  /** Returns how many photos this guest has already uploaded (0–10). */
  async getGuestPhotoCount(fullname: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_guest_photo_count', {
      p_fullname: fullname.trim(),
    });
    if (error) { console.error('getGuestPhotoCount error:', error); return 0; }
    return data as number;
  }

  /** Fetch all photos, newest first. */
  async getPhotos(): Promise<WeddingPhoto[]> {
    const { data, error } = await supabase
      .from(PHOTO_TABLE)
      .select('id, storage_path, uploader_name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      uploader_name: row.uploader_name,
      created_at: row.created_at,
      url: supabase.storage
        .from(PHOTO_BUCKET)
        .getPublicUrl(row.storage_path).data.publicUrl,
    }));
  }

  /** Compress, upload to Storage, insert metadata row. Returns WeddingPhoto. */
  async uploadPhoto(file: File, uploaderName: string): Promise<WeddingPhoto> {
    const compressed = await this.compressImage(file, 1600, 0.82);

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `photos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, compressed, { contentType: 'image/jpeg', upsert: false });

    if (uploadError) throw uploadError;

    const { data, error: insertError } = await supabase
      .from(PHOTO_TABLE)
      .insert({ storage_path: path, uploader_name: uploaderName })
      .select('id, storage_path, uploader_name, created_at')
      .single();

    if (insertError) {
      await supabase.storage.from(PHOTO_BUCKET).remove([path]);
      throw insertError;
    }

    return {
      id: data.id,
      uploader_name: data.uploader_name,
      created_at: data.created_at,
      url: supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl,
    };
  }

  /** Resize to maxWidth and re-encode as JPEG using an off-screen canvas. */
  compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

}