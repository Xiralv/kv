import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./tabs-pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'verify-rsvp',
    loadChildren: () => import('./pages/verify-rsvp/verify-rsvp.module').then(m => m.VerifyRsvpPageModule)
  },
  {
    path: 'programme',
    loadChildren: () => import('./tabs-pages/programme/programme.module').then( m => m.ProgrammePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
