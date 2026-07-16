import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { SupabaseService, WeddingPhoto } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-photos',
  templateUrl: 'photos.page.html',
  styleUrls: ['photos.page.scss'],
  standalone: false,
})
export class PhotosPage implements OnInit {

  photos: WeddingPhoto[] = [];
  isLoading = true;
  isUploading = false;
  uploadProgress = 0;
  selectedPhoto: WeddingPhoto | null = null;

  guestName: string | null = localStorage.getItem('user_fullname');
  uploadState: 'checking' | 'allowed' | 'not-rsvpd' | 'not-attending' | 'limit-reached' = 'checking';

  readonly PHOTO_LIMIT = 10;
  guestPhotoCount = 0;

  constructor(
    private api: SupabaseService,
    private global: GlobalService,
  ) { }

  async ngOnInit() {
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


  private async checkUploadPermission(): Promise<void> {
    if (!this.guestName) {
      this.uploadState = 'not-rsvpd';
      return;
    }
    try {
      const confirmed = await this.api.isConfirmedGuest(this.guestName);
      if (!confirmed) { this.uploadState = 'not-attending'; return; }
      this.guestPhotoCount = await this.api.getGuestPhotoCount(this.guestName);
      this.uploadState = this.guestPhotoCount >= this.PHOTO_LIMIT ? 'limit-reached' : 'allowed';
    } catch {
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

  // ─── Camera: opens rear camera (environment) ───────────────────────────────
  async openRearCamera(): Promise<void> {
    await this.capturePhoto(CameraSource.Camera, 'environment');
  }

  // ─── Camera: opens front camera (selfie / user-facing) ────────────────────
  async openFrontCamera(): Promise<void> {
    await this.capturePhoto(CameraSource.Camera, 'user');
  }

  // ─── Gallery: opens camera roll / photo library ────────────────────────────
  async openGallery(): Promise<void> {
    await this.capturePhoto(CameraSource.Photos, 'environment');
  }

  /**
   * Core capture method.
   * Uses @capacitor/camera which:
   *   - In a browser → falls back to @ionic/pwa-elements (getUserMedia overlay
   *     with front/rear toggle, or native file picker for Photos source)
   *   - On native iOS/Android → uses the native camera / photo library
   *
   * direction: 'environment' = rear camera, 'user' = front camera (selfie)
   */
  private async capturePhoto(
    source: CameraSource,
    direction: 'environment' | 'user',
  ): Promise<void> {
    // Guard checks
    if (this.uploadState !== 'allowed') return;

    const stillConfirmed = await this.api.isConfirmedGuest(this.guestName || '');
    if (!stillConfirmed) {
      this.uploadState = 'not-attending';
      this.global.presentToast('Only confirmed guests can share photos', 'warning', 'alert-circle-outline');
      return;
    }

    this.guestPhotoCount = await this.api.getGuestPhotoCount(this.guestName || '');
    if (this.guestPhotoCount >= this.PHOTO_LIMIT) {
      this.uploadState = 'limit-reached';
      this.global.presentToast('You\'ve reached the 10-photo limit', 'warning', 'alert-circle-outline');
      return;
    }

    let dataUrl: string;
    try {
      const image = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.DataUrl,
        source,
        // direction only applies when source = Camera (ignored for Photos)
        direction: direction === 'user' ? CameraDirection.Front : CameraDirection.Rear, // 0 = rear, 1 = front
        correctOrientation: true,
        allowEditing: false,
        presentationStyle: 'popover', // less jarring than fullscreen on iPad
      });

      if (!image.dataUrl) {
        this.global.presentToast('No photo was captured', 'warning', 'alert-circle-outline');
        return;
      }
      dataUrl = image.dataUrl;
    } catch (err: any) {
      // User cancelled — not an error
      if (err?.message?.includes('cancelled') || err?.message?.includes('No image picked')) return;
      console.error('Camera error:', err);
      this.global.presentToast('Camera error — please try again', 'warning', 'alert-circle-outline');
      return;
    }

    // Convert dataUrl → File for upload
    const file = this.dataUrlToFile(dataUrl, `wedding-photo-${Date.now()}.jpg`);
    await this.uploadFile(file);
  }

  /** Convert a base64 data URL to a File object. */
  private dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/:(.*?);/)![1];
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  /** Shared upload logic used by all three capture paths. */
  private async uploadFile(file: File): Promise<void> {
    if (file.size > 10 * 1024 * 1024) {
      this.global.presentToast('Photo is too large — please try another', 'warning', 'alert-circle-outline');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 20;

    try {
      const uploaded = await this.api.uploadPhoto(file, this.guestName || 'Guest');
      this.uploadProgress = 95;
      this.photos = [uploaded, ...this.photos];
      this.guestPhotoCount += 1;
      if (this.guestPhotoCount >= this.PHOTO_LIMIT) this.uploadState = 'limit-reached';
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
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  openLightbox(photo: WeddingPhoto) { this.selectedPhoto = photo; }
  closeLightbox() { this.selectedPhoto = null; }

  get photoCount(): number { return this.photos.length; }
}