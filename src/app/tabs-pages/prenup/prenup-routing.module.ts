import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrenupPage } from './prenup.page';

const routes: Routes = [
  { path: '', component: PrenupPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrenupPageRoutingModule { }
