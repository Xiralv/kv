import { Component, OnInit } from '@angular/core';
import { SupabaseService, WeddingPhoto } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-photos',
  templateUrl: 'photos.page.html',
  styleUrls: ['photos.page.scss'],
  standalone: false,
})
export class PhotosPage implements OnInit {

  photos: WeddingPhoto[]    = [];
  isLoading                 = true;
  isUploading               = false;
  uploadProgress            = 0;
  selectedPhoto: WeddingPhoto | null = null;

  guestName: string | null  = localStorage.getItem('user_fullname');

  // Three possible upload states:
  //  'checking'    — verifying with Supabase on page load
  //  'allowed'     — confirmed attending guest, can upload
  //  'not-rsvpd'   — no name stored locally yet
  //  'not-attending' — name found but attend !== true
  uploadState: 'checking' | 'allowed' | 'not-rsvpd' | 'not-attending' | 'limit-reached' = 'checking';

  readonly PHOTO_LIMIT = 10;
  guestPhotoCount = 0;          // how many this guest has already uploaded

  constructor(
    private api: SupabaseService,
    private global: GlobalService,
  ) {}



  async ngOnInit() {
    // console.log('ngOnInit')
    // await Promise.all([
    //   this.loadPhotos(),
    //   this.checkUploadPermission(),
    // ]);
  }


  async ionViewWillEnter() {
    this.guestName = localStorage.getItem('user_fullname');
    await Promise.all([
      this.loadPhotos(),
      this.checkUploadPermission(),
    ]);
  }

  /** DB check — can this guest upload? */
  private async checkUploadPermission(): Promise<void> {
    console.log('this.guestName',this.guestName)
    if (!this.guestName) {
      this.uploadState = 'not-rsvpd';
      return;
    }
    try {
      const confirmed = await this.api.isConfirmedGuest(this.guestName);
      if (!confirmed) {
        this.uploadState = 'not-attending';
        return;
      }
      // Fetch their current upload count from the DB
      this.guestPhotoCount = await this.api.getGuestPhotoCount(this.guestName);
      this.uploadState = this.guestPhotoCount >= this.PHOTO_LIMIT ? 'limit-reached' : 'allowed';
    } catch {
      // If the check fails (network issue), fall back to not-rsvpd
      // so they're prompted to re-enter their name rather than seeing
      // a broken upload button.
      this.uploadState = 'not-rsvpd';
    }
  }

  async loadPhotos(): Promise<void> {
    this.isLoading = true;
    try {
      this.photos = await this.api.getPhotos();
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  triggerFilePicker(): void {
    const input = document.getElementById('photo-file-input') as HTMLInputElement;
    input?.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith('image/')) {
      this.global.presentToast('Please select an image file', 'warning', 'alert-circle-outline');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.global.presentToast('Please choose a photo under 10 MB', 'warning', 'alert-circle-outline');
      return;
    }

    // Re-verify server-side before every upload — guards against a guest
    // who later changed their RSVP to decline.
    const stillConfirmed = await this.api.isConfirmedGuest(this.guestName || '');
    if (!stillConfirmed) {
      this.uploadState = 'not-attending';
      this.global.presentToast('Only confirmed guests can share photos', 'warning', 'alert-circle-outline');
      return;
    }
    // Re-check count server-side before every upload
    this.guestPhotoCount = await this.api.getGuestPhotoCount(this.guestName || '');
    if (this.guestPhotoCount >= this.PHOTO_LIMIT) {
      this.uploadState = 'limit-reached';
      this.global.presentToast('You\'ve reached the 10-photo limit', 'warning', 'alert-circle-outline');
      return;
    }

    this.isUploading    = true;
    this.uploadProgress = 0;

    try {
      this.uploadProgress = 20;
      const uploaded = await this.api.uploadPhoto(file, this.guestName || 'Guest');
      this.uploadProgress = 95;
      this.photos = [uploaded, ...this.photos];
      this.guestPhotoCount += 1;
      if (this.guestPhotoCount >= this.PHOTO_LIMIT) {
        this.uploadState = 'limit-reached';
      }
      this.uploadProgress = 100;
      this.global.presentToast(
        this.guestPhotoCount >= this.PHOTO_LIMIT
          ? 'Photo shared! You\'ve reached the 10-photo limit 📸'
          : `Photo shared! 📸 (${this.guestPhotoCount}/${this.PHOTO_LIMIT})`,
        'success',
        'checkmark-circle-outline',
      );
    } catch (err: any) {
      console.error(err);
      this.global.presentToast(
        err?.message || 'Upload failed — please try again',
        'warning',
        'alert-circle-outline',
      );
    } finally {
      this.isUploading    = false;
      this.uploadProgress = 0;
      input.value         = '';
    }
  }

  openLightbox(photo: WeddingPhoto)  { this.selectedPhoto = photo; }
  closeLightbox()                     { this.selectedPhoto = null;  }

  get photoCount(): number { return this.photos.length; }
}