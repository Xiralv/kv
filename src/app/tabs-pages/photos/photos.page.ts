import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonInfiniteScroll } from '@ionic/angular';
import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera';
import { SupabaseService, WeddingPhoto } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-photos',
  templateUrl: 'photos.page.html',
  styleUrls: ['photos.page.scss'],
  standalone: false,
})
export class PhotosPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;

  photos: WeddingPhoto[]    = [];
  isLoading                 = true;
  isUploading               = false;
  uploadProgress            = 0;
  selectedPhoto: WeddingPhoto | null = null;

  // ── Pagination ─────────────────────────────────────────────────────────────
  private readonly PAGE_SIZE = 10;
  private currentPage        = 0;
  isLoadingMore              = false;
  hasMorePhotos              = true;

  guestName: string | null = localStorage.getItem('user_fullname');
  uploadState: 'checking' | 'allowed' | 'not-rsvpd' | 'not-attending' | 'limit-reached' = 'checking';

  readonly PHOTO_LIMIT = 10;
  guestPhotoCount      = 0;

  constructor(
    private api: SupabaseService,
    private global: GlobalService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    this.guestName = localStorage.getItem('user_fullname');

    // Reset pagination data immediately
    this.currentPage   = 0;
    this.hasMorePhotos = true;
    this.photos        = [];

    await Promise.all([
      this.loadPhotos(),
      this.checkUploadPermission(),
    ]);

    // Defer infinite scroll re-enable until after Angular has rendered the
    // updated [disabled]="!hasMorePhotos" binding and the ViewChild is live.
    // A single tick is enough — setTimeout(0) runs after the current render cycle.
    setTimeout(() => {
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = false;
      }
    }, 0);
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

  /** Initial load — first page only. */
  async loadPhotos(): Promise<void> {
    this.isLoading = true;
    try {
      const page = await this.api.getPhotos(0, this.PAGE_SIZE);
      this.photos = page;
      if (page.length < this.PAGE_SIZE) {
        this.hasMorePhotos = false;
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoading = false;
    }
  }

  /** Called by ion-infinite-scroll when the user nears the bottom. */
  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    // Safety guard — shouldn't fire if disabled, but belt-and-suspenders
    if (!this.hasMorePhotos || this.isLoadingMore) {
      await event.target.complete();
      return;
    }

    this.isLoadingMore = true;
    this.currentPage  += 1;

    try {
      const page = await this.api.getPhotos(this.currentPage, this.PAGE_SIZE);

      // Run inside NgZone so Angular detects the array mutation
      this.ngZone.run(() => {
        this.photos = [...this.photos, ...page];
        if (page.length < this.PAGE_SIZE) {
          this.hasMorePhotos = false;
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      this.isLoadingMore = false;
      // Always call complete() so Ionic re-arms the scroll listener
      await event.target.complete();
    }
  }

  // ─── Camera ─────────────────────────────────────────────────────────────────

  async openRearCamera(): Promise<void> {
    await this.capturePhoto(CameraSource.Camera, 'environment');
  }
  async openFrontCamera(): Promise<void> {
    await this.capturePhoto(CameraSource.Camera, 'user');
  }
  async openGallery(): Promise<void> {
    await this.capturePhoto(CameraSource.Photos, 'environment');
  }

  private async capturePhoto(source: CameraSource,direction: 'environment' | 'user',): Promise<void> {
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
        direction: direction === 'user' ? CameraDirection.Front : CameraDirection.Rear,
        correctOrientation: true,
        allowEditing: false,
        presentationStyle: 'popover',
      });

      if (!image.dataUrl) {
        this.global.presentToast('No photo was captured', 'warning', 'alert-circle-outline');
        return;
      }
      dataUrl = image.dataUrl;
    } catch (err: any) {
      if (err?.message?.includes('cancelled') || err?.message?.includes('No image picked')) return;
      console.error('Camera error:', err);
      this.global.presentToast('Camera error — please try again', 'warning', 'alert-circle-outline');
      return;
    }

    const file = this.dataUrlToFile(dataUrl, `wedding-photo-${Date.now()}.jpg`);
    await this.uploadFile(file);
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(',');
    const mime  = header.match(/:(.*?);/)![1];
    const bytes = atob(base64);
    const arr   = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  private async uploadFile(file: File): Promise<void> {
    if (file.size > 10 * 1024 * 1024) {
      this.global.presentToast('Photo is too large — please try another', 'warning', 'alert-circle-outline');
      return;
    }

    this.isUploading    = true;
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
      this.isUploading    = false;
      this.uploadProgress = 0;
    }
  }

  openLightbox(photo: WeddingPhoto)  { 
    this.selectedPhoto = photo; 
  }

  closeLightbox() { 
    this.selectedPhoto = null;  
  }

  get photoCount(): number { 
    return this.photos.length; 
  }
}