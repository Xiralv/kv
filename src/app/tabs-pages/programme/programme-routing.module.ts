import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProgrammePage } from './programme.page';

const routes: Routes = [
  {
    path: '',
    component: ProgrammePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProgrammePageRoutingModule { }
