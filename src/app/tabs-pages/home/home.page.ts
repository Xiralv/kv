import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { AlertController, IonRouterOutlet, ModalController } from '@ionic/angular';
import { VerifyRsvpPage } from 'src/app/pages/verify-rsvp/verify-rsvp.page';
import { SupabaseService } from 'src/app/services/api/supabase.service';
import * as L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;

const churchIcon = L.icon({
  iconUrl: 'assets/leaflet/3.png',
  iconSize: [38, 65],
});

const receptionIcon = L.icon({
  iconUrl: 'assets/leaflet/2.png',
  iconSize: [38, 65],
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnDestroy {

  user_fullname: string | null = null;
  hasSubmittedRsvp = false;   // drives the sticky button label
  bannerHeight = Math.min(window.innerHeight * 0.3, 300);
  private map!: L.Map;

  churchImage = 'https://vismin.ph/wp-content/uploads/2024/07/Our-Mother-of-Perpetual-Help-Parish-1-1024x768.jpg';
  churchLink = 'https://www.google.com/search?sca_esv=3a209260479b6c25&sxsrf=AE3TifNNRX4BwcdNvBi8np3xGuJurDAArg:1762489943630&q=our+lady+of+perpetual+help+davao&source=lnms&fbs=AIIjpHwdlVWI4oi2g38E8_BbusNm3pTf6ItdW8-u0JVVBgXow2SS4XfWu_GDEb99WFnlrQRu8iokckxH_JDkxqr6KkGW4h-UbOrZy4_VKBu-AShUrAooLdiGQYtSQDT99Xap-srDPez-ucnQiAzRh8mmP1kRjLDdbJzfrcZft5EkU32xioTPtdvXjSP0QmbpiIoU0I1Tueb0jSePp7oklbvhDoAy9soWPuopFzaG3PmlHIaSuWt66cU&sa=X&ved=2ahUKEwjEpYrYmt-QAxV8iK8BHQAvE28Q0pQJegQICRAB&biw=1512&bih=857&dpr=2';
  receptionImage = 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/702406430.jpg?k=23c7108d3cbaaefe1151a0cbe2e8deed01eb26e1ff8654468db1a7b0c3aa217d&o=';
  receptionLink = 'https://www.waterfronthotels.com.ph/waterfront-insular-hotel-davao/';
  selectedImage: string | null = null;

  // ─── Countdown ────────────────────────────────────────────────────────────
  private readonly WEDDING: Date = new Date('2026-12-18T15:00:00');
  private countdownInterval: any;

  countdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };
  isWeddingDay = false;
  weddingDayPassed = false;

  schedule = [
    { time: '3:00 PM', label: 'Ceremony begins', hour: 15, minute: 0, isNow: false, isPast: false },
    { time: '4:30 PM', label: 'Cocktail hour', hour: 16, minute: 30, isNow: false, isPast: false },
    { time: '6:00 PM', label: 'Reception & dinner', hour: 18, minute: 0, isNow: false, isPast: false },
    { time: '7:00 PM', label: 'Speeches & first dance', hour: 19, minute: 0, isNow: false, isPast: false },
    { time: '8:00 PM', label: 'Open floor / party 🎉', hour: 20, minute: 0, isNow: false, isPast: false },
  ];

  constructor(
    private modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet,
    private alertCtrl: AlertController,
    private api: SupabaseService,           // ← injected for DB check
  ) { }

  async ngAfterViewInit() {
    setTimeout(() => this.initMap(), 1000);
    this.user_fullname = localStorage.getItem('user_fullname') || null;

    // Check Supabase on load — catches guests who submitted on a different device
    await this.checkRsvpStatus();
    this.startCountdown();
  }

  /**
   * Looks up the stored name in Supabase.
   * Sets hasSubmittedRsvp = true if every guest in the group has a non-null attend value.
   * Falls back gracefully — a network failure just leaves the button as "RSVP Now".
   */
  private async checkRsvpStatus(): Promise<void> {
    if (!this.user_fullname) {
      // No name stored — guest hasn't interacted with the RSVP yet on this device
      this.hasSubmittedRsvp = false;
      return;
    }

    try {
      const { data, error } = await this.api.verifyUser({ fullname: this.user_fullname });

      if (error || !data || data.length === 0) {
        this.hasSubmittedRsvp = false;
        return;
      }

      // attend is non-null (true or false) → they've already answered
      // attend is null → not yet answered
      this.hasSubmittedRsvp = data.every(
        (g: any) => g.attend !== null && g.attend !== undefined
      );
    } catch {
      // Network error or Supabase down — fail silently, show "RSVP Now"
      this.hasSubmittedRsvp = false;
    }
  }

  // ─── Countdown ────────────────────────────────────────────────────────────

  private startCountdown(): void {
    this.tickCountdown();
    this.countdownInterval = setInterval(() => this.tickCountdown(), 1000);
  }

  private tickCountdown(): void {
    const now = new Date();
    const diff = this.WEDDING.getTime() - now.getTime();

    const todayDate = now.toDateString();
    const weddingDate = this.WEDDING.toDateString();
    this.isWeddingDay = todayDate === weddingDate;
    this.weddingDayPassed = diff < 0 && !this.isWeddingDay;

    if (!this.isWeddingDay && diff > 0) {
      const totalSeconds = Math.floor(diff / 1000);
      const d = Math.floor(totalSeconds / 86400);
      const h = Math.floor((totalSeconds % 86400) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      this.countdown = {
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
      };
    }

    if (this.isWeddingDay) {
      this.updateSchedule(now);
    }
  }

  private updateSchedule(now: Date): void {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    this.schedule = this.schedule.map((event, i) => {
      const eventMinutes = event.hour * 60 + event.minute;
      const nextEvent = this.schedule[i + 1];
      const nextMinutes = nextEvent ? nextEvent.hour * 60 + nextEvent.minute : 24 * 60;
      return {
        ...event,
        isNow: currentMinutes >= eventMinutes && currentMinutes < nextMinutes,
        isPast: currentMinutes >= nextMinutes,
      };
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // ─── map ────────────────────────────────────────────────────────────────────

  private initMap(): void {
    this.map = L.map('map').setView([7.0992912, 125.62745815], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const churchCoords: L.LatLngExpression = [7.0921547, 125.6071803];
    const receptionCoords: L.LatLngExpression = [7.1064277, 125.647736];

    L.marker(churchCoords, { icon: churchIcon }).addTo(this.map).bindPopup(`
      <div style="text-align:center;">
        <b>Ceremony</b><br>
        Our Mother of Perpetual Help Parish<br>
        <a href="${this.churchLink}" target="_blank">
          <img src="${this.churchImage}" style="width:170px;margin-top:5px;border-radius:8px;">
        </a>
      </div>
    `);

    L.marker(receptionCoords, { icon: receptionIcon }).addTo(this.map).bindPopup(`
      <div style="text-align:center;">
        <b>Reception</b><br>
        Waterfront Insular Hotel Davao<br>
        <a href="${this.receptionLink}" target="_blank">
          <img src="${this.receptionImage}" style="width:200px;margin-top:5px;border-radius:8px;">
        </a>
      </div>
    `);

    const group = L.featureGroup([L.marker(churchCoords), L.marker(receptionCoords)]);
    this.map.fitBounds(group.getBounds().pad(0.3));
  }

  // ─── RSVP modal ─────────────────────────────────────────────────────────────

  async rsvp() {
    const modal = await this.modalCtrl.create({
      component: VerifyRsvpPage,
      presentingElement: this.routerOutlet.nativeEl,
      // When the guest has already submitted, pass their stored name so the
      // modal can skip the name-input slide and jump straight to the summary.
      componentProps: this.hasSubmittedRsvp && this.user_fullname
        ? { autoLoadName: this.user_fullname }
        : {},
    });
    await modal.present();
    await modal.onWillDismiss();

    // Re-read name (may have been set for the first time inside the modal)
    this.user_fullname = localStorage.getItem('user_fullname') || null;

    // Re-check DB so button label updates immediately after they submit
    await this.checkRsvpStatus();
    this.startCountdown();
  }

  // ─── misc ────────────────────────────────────────────────────────────────────

  async canDismiss(): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'Do you really want to close this modal?',
      buttons: [
        { text: 'Cancel', role: 'cancel', handler: () => false },
        { text: 'Yes', role: 'confirm', handler: () => true },
      ],
    });
    await alert.present();
    const { role } = await alert.onWillDismiss();
    return role === 'confirm';
  }

  onScroll(ev: any) {
    const scrollTop = ev.detail.scrollTop;
    this.bannerHeight = Math.max(250 - scrollTop, 56);
  }

  openImage(img: string) {
    this.selectedImage = img;
  }
  closeImage() {
    this.selectedImage = null;
  }
}