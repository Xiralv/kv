import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttirePage } from './attire.page';

const routes: Routes = [
  { path: '', component: AttirePage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttirePageRoutingModule { }
