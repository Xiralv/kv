import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammePage } from './programme.page';
import { ProgrammePageRoutingModule } from './programme-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ProgrammePageRoutingModule
  ],
  declarations: [ProgrammePage]
})
export class ProgrammePageModule { }
