import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'verify-rsvp',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./tabs-pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'verify-rsvp',
    loadChildren: () => import('./pages/verify-rsvp/verify-rsvp.module').then(m => m.VerifyRsvpPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
