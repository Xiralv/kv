import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PrenupPageRoutingModule } from './prenup-routing.module';
import { PrenupPage } from './prenup.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PrenupPageRoutingModule,
  ],
  declarations: [PrenupPage]
})
export class PrenupPageModule { }
