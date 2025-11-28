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

  isAlreadyAnswered: boolean = false;


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


  async onConfirmRSVP() {
    for (let guests of this.arrGuests) {
      try {
        const updated = await this.api.updateAttend(guests.id, guests.attend);
        console.log('Attend updated:', updated);
        this.swiperRef.nativeElement.swiper.slideNext();
      } catch (err) {
        console.error('Error updating attend:', err);
      }

    }
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
      // this.global.presentToast(`See you on our special day!`, 'success', 'checkmark-circle-outline');

      if (!data[0].attend) {
        this.swiperRef.nativeElement.swiper.slideNext();
        this.arrGuests = await this.api.getGuestWithRelations(this.rsvpForm.value.fullname);
      } else {
        this.isAlreadyAnswered = true;
        const swiper = this.swiperRef.nativeElement.swiper;
        swiper.slideTo(swiper.activeIndex + 2);

        // this.swiperRef.nativeElement.swiper.slideNext();
      }


    } else {
      this.global.presentToast(`Oh no! There seems to be an error please contact Kamille / Vlarix`, 'warning', 'alert-circle-outline');

    }

  }


  get isConfirmDisabled(): boolean {
    // Return true if any guest has attend == null
    return this.arrGuests.some((guest: Guest) => guest.attend === null);
  }


  get guestCount(): number {
    return this.arrGuests?.length || 0;
  }

  get hasDeclined(): boolean {
    return this.arrGuests?.some((g: Guest) => g.attend === false);
  }

  get hasAccepted(): boolean {
    return this.arrGuests?.some((g: Guest) => g.attend === true);
  }

  get messageText(): string {
    // Handle single guest separately
    if (this.guestCount === 1) {
      const singleGuest = this.arrGuests[0];

      if (singleGuest.attend) {
        return "Thank you for confirming! We’re excited to celebrate with you! 💍";
      } else {
        return "Thanks for letting us know! We’re sad you can’t make it, but for any changes in the future, please don't hesitate to message us! 💛";
      }
    }

    // Handle multiple guests
    if (this.hasAccepted && this.hasDeclined) {
      return "Thank you for confirming! We're excited to see those who can come, and we’ll miss the ones who can’t make it. 💛";
    } else if (this.hasDeclined && !this.hasAccepted) {
      return "Thanks for letting us know! It's sad that you'll not be able to join us, but for any changes in the future, please don't hesitate to message us!";
    } else {
      return "See you on our wedding day! 💍";
    }
  }

}






