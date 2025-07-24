import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private toastController: ToastController
  ) { }

  async presentToast(msg: string, color: string, icon: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 5000,
      position: "bottom",
      color: color,
      icon: icon,
      cssClass: 'toast-text-color'
    });

    await toast.present();
  }
}
