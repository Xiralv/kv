import { Component, OnInit } from '@angular/core';
import { PrenupPhoto, SupabaseService } from 'src/app/services/api/supabase.service';

@Component({
  selector: 'app-prenup',
  templateUrl: 'prenup.page.html',
  styleUrls: ['prenup.page.scss'],
  standalone: false,
})
export class PrenupPage implements OnInit {

  photos: PrenupPhoto[]              = [];
  isLoading                          = true;
  loadError                          = false;
  selectedPhoto: PrenupPhoto | null  = null;

  constructor(private api: SupabaseService) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    await this.loadPhotos();
  }

  async loadPhotos(): Promise<void> {
    this.isLoading = true;
    this.loadError = false;
    try {
      this.photos = await this.api.getPrenupPhotos();
    } catch (err) {
      console.error(err);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }

  async doRefresh(event: any) {
    await this.loadPhotos();
    event.target.complete();
  }

  openLightbox(photo: PrenupPhoto) {
    this.selectedPhoto = photo;
  }

  closeLightbox() {
    this.selectedPhoto = null;
  }

  get photoCount(): number {
    return this.photos.length;
  }
}
