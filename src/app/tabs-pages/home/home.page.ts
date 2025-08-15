import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, ModalController } from '@ionic/angular';
import { VerifyRsvpPage } from 'src/app/pages/verify-rsvp/verify-rsvp.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  user_fullname: string | null = null;
  bannerHeight = Math.min(window.innerHeight * 0.3, 300);

  constructor(
    private modalCtrl: ModalController,
    private routerOutlet: IonRouterOutlet

  ) { }


  ngOnInit() {
    this.user_fullname = localStorage.getItem('user_fullname') ? localStorage.getItem('user_fullname') : '';
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
