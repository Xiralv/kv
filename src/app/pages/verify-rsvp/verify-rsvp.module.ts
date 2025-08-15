import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerifyRsvpPageRoutingModule } from './verify-rsvp-routing.module';

import { VerifyRsvpPage } from './verify-rsvp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerifyRsvpPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [VerifyRsvpPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class VerifyRsvpPageModule { }
