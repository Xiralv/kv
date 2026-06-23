import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttirePage } from './attire.page';
import { AttirePageRoutingModule } from './attire-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    AttirePageRoutingModule
  ],
  declarations: [AttirePage]
})
export class AttirePageModule { }
