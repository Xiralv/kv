import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OurStoryPage } from './our-story.page';


import { OurStoryPageRoutingModule } from './our-story-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    OurStoryPageRoutingModule
  ],
  declarations: [OurStoryPage]
})
export class OurStoryPageModule { }
