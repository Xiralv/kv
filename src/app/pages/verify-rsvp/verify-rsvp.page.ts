import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-verify-rsvp',
  templateUrl: './verify-rsvp.page.html',
  styleUrls: ['./verify-rsvp.page.scss'],
  standalone: false
})
export class VerifyRsvpPage implements OnInit {
  @ViewChild('swiperRef', { static: false }) swiperRef!: ElementRef;
  rsvpForm: FormGroup


  constructor(
    private fb: FormBuilder,
    private api: SupabaseService,
    private global: GlobalService,
    private router: Router,
  ) {
    this.rsvpForm = this.fb.group({
      fullname: ['', [Validators.required,]],
    });
  }



  async ngOnInit() {

  }



  async onSubmit() {

    const { data, error } = await this.api.verifyUser(this.rsvpForm.value);

    if (data && data.length > 0 && data[0].fullname) {
      // Safe to use data[0].fullname here
      this.global.presentToast(`See you on our special day!`, 'success', 'checkmark-circle-outline');
      // localStorage.setItem('user_fullname', `${data[0].fullname}`)
      // this.router.navigateByUrl('/tabs', { replaceUrl: true });

      this.swiperRef.nativeElement.swiper.slideNext();

    } else {
      this.global.presentToast(`Oh no! There seems to be an error please contact Kamille / Vlarix`, 'warning', 'alert-circle-outline');

    }

  }

}
