import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/services/api/supabase.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-verify-rsvp',
  templateUrl: './verify-rsvp.page.html',
  styleUrls: ['./verify-rsvp.page.scss'],
  standalone: false
})
export class VerifyRsvpPage implements OnInit {
  rsvpForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private api: SupabaseService,
    private global: GlobalService
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
      this.global.presentToast(`User ${data[0].fullname} is inivited!`, 'success', 'checkmark-circle-outline');
    } else {
      this.global.presentToast(`Opps! We're having trouble finding your invite. Please check your spelling of you name or contact the couple`, 'warning', 'alert-circle-outline');

    }

  }

}
