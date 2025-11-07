import { AfterViewInit, Component, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { VerifyRsvpPage } from 'src/app/pages/verify-rsvp/verify-rsvp.page';
import * as L from 'leaflet';

// Fix default icon path issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [38, 65],
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit {

  user_fullname: string | null = null;
  bannerHeight = Math.min(window.innerHeight * 0.3, 300);
  private map!: L.Map;
  churchImage = "https://vismin.ph/wp-content/uploads/2024/07/Our-Mother-of-Perpetual-Help-Parish-1-1024x768.jpg";
  churchLink = "https://www.google.com/search?sca_esv=3a209260479b6c25&sxsrf=AE3TifNNRX4BwcdNvBi8np3xGuJurDAArg:1762489943630&q=our+lady+of+perpetual+help+davao&source=lnms&fbs=AIIjpHwdlVWI4oi2g38E8_BbusNm3pTf6ItdW8-u0JVVBgXow2SS4XfWu_GDEb99WFnlrQRu8iokckxH_JDkxqr6KkGW4h-UbOrZy4_VKBu-AShUrAooLdiGQYtSQDT99Xap-srDPez-ucnQiAzRh8mmP1kRjLDdbJzfrcZft5EkU32xioTPtdvXjSP0QmbpiIoU0I1Tueb0jSePp7oklbvhDoAy9soWPuopFzaG3PmlHIaSuWt66cU&sa=X&ved=2ahUKEwjEpYrYmt-QAxV8iK8BHQAvE28Q0pQJegQICRAB&biw=1512&bih=857&dpr=2";

  receptionImage = "https://cf.bstatic.com/xdata/images/hotel/max1024x768/702406430.jpg?k=23c7108d3cbaaefe1151a0cbe2e8deed01eb26e1ff8654468db1a7b0c3aa217d&o=";
  receptionLink = "https://www.waterfronthotels.com.ph/waterfront-insular-hotel-davao/";

  constructor(
    private modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet

  ) { }


  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 1000);
    this.user_fullname = localStorage.getItem('user_fullname') ? localStorage.getItem('user_fullname') : '';
  }



  private initMap(): void {
    // Create the map centered between your two points
    this.map = L.map('map').setView([7.0885, 125.6123], 14);

    // Add OpenStreetMap tiles (no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);


    const churchCoords: L.LatLngExpression = [7.0921547, 125.6071803];
    const receptionCoords: L.LatLngExpression = [7.1064277, 125.647736];

    // Add markers
    L.marker(churchCoords).addTo(this.map).bindPopup(`
    <div style="text-align:center;">
      <b>Ceremony</b><br>
      Our Mother of Perpetual Help Parish<br>
      <a href="${this.churchLink}" target="_blank">
      <img src="${this.churchImage}" style="width:170px; margin-top:5px; border-radius:8px;">
    </div>
  `);
    L.marker(receptionCoords).addTo(this.map).bindPopup(`<div style="text-align:center;">
      <b>Reception</b><br>
      Waterfront Insular Hotel Davao<br>
      <a href="${this.receptionLink}" target="_blank">
      <img src="${this.receptionImage} style="width:200px; margin-top:5px; border-radius:8px;">
    </div>`);

    // Fit the map bounds to show both markers
    const group = L.featureGroup([
      L.marker(churchCoords),
      L.marker(receptionCoords)
    ]);
    this.map.fitBounds(group.getBounds().pad(0.3));

  }


  async rsvp() {
    const modal = await this.modalCtrl.create({
      component: VerifyRsvpPage,
      presentingElement: this.routerOutlet.nativeEl,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    // if (role === 'confirm') {
    //   this.message = `Hello, ${data}!`;
    // }
  }



  onScroll(ev: any) {
    const scrollTop = ev.detail.scrollTop;
    const maxHeight = 250;
    const minHeight = 56;

    this.bannerHeight = Math.max(maxHeight - scrollTop, minHeight);
  }

}
