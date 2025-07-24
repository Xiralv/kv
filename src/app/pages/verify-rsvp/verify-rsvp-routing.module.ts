import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerifyRsvpPage } from './verify-rsvp.page';

const routes: Routes = [
  {
    path: '',
    component: VerifyRsvpPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerifyRsvpPageRoutingModule {}
