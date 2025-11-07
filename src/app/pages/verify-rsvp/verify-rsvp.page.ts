import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AnimationOptions } from 'ngx-lottie';
import { SupabaseService } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

interface Guest {
  id: string,
  attend: boolean
  full_name: string
}
@Component({
  selector: 'app-verify-rsvp',
  templateUrl: './verify-rsvp.page.html',
  styleUrls: ['./verify-rsvp.page.scss'],
  standalone: false
})


export class VerifyRsvpPage implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  rsvpForm: FormGroup;
  arrGuests: Array<Guest> | any;
  // arrGuests = [{ id: 1, fullname: 'person1' }, { id: 2, full_name: 'person2' }]
  congratsOptions: AnimationOptions = {
    path: 'assets/lottiefiles/congratulation.json',
    loop: true,
    autoplay: true,
  };

  wavingOptions: AnimationOptions = {
    path: 'assets/lottiefiles/two_people_waving.json', // 👈 direct path
  };

  constructor(
    private fb: FormBuilder,
    private api: SupabaseService,
    private global: GlobalService,
    private modalCtrl: ModalController,

    private router: Router,
  ) {

    // fetch('assets/lottiefiles/two_people_waving.json')
    //   .then(res => res.json())
    //   .then(data => console.log('✅ Lottie JSON loaded', data))
    //   .catch(err => console.error('❌ Lottie JSON missing', err));

    this.rsvpForm = this.fb.group({
      fullname: ['', [Validators.required,]],
    });
  }



  async ngOnInit() {
  }


  selectButton(guestData: Guest, button: string) {
    guestData.attend = button == 'yes' ? true : false;

    this.arrGuests = [...this.arrGuests];
  }


  get isConfirmDisabled(): boolean {
    // Return true if any guest has attend == null
    return this.arrGuests.some((guest: Guest) => guest.attend === null);
  }

  onConfirmRSVP() {
    this.swiperRef.nativeElement.swiper.slideNext();
  }


  closeModal() {
    this.modalCtrl.dismiss()
  }



  /**
   * Submit button on inputting a Full name
   */
  async onSubmit() {
    const { data, error } = await this.api.verifyUser(this.rsvpForm.value);

    if (data && data.length > 0 && data[0].full_name) {
      this.global.presentToast(`See you on our special day!`, 'success', 'checkmark-circle-outline');

      this.swiperRef.nativeElement.swiper.slideNext();
      this.arrGuests = await this.api.getGuestWithRelations(this.rsvpForm.value.fullname);


    } else {
      this.global.presentToast(`Oh no! There seems to be an error please contact Kamille / Vlarix`, 'warning', 'alert-circle-outline');

    }

  }

}
