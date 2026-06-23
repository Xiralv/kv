import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'our-story',
        loadChildren: () => import('../our-story/our-story.module').then(m => m.OurStoryPageModule)
      },
      {
        path: 'programme',
        loadChildren: () => import('../programme/programme.module').then(m => m.ProgrammePageModule)
      },
      {
        path: 'faq',
        loadChildren: () => import('../faq/faq.module').then(m => m.FaqPageModule)
      },
      {
        path: 'attire',
        loadChildren: () => import('../attire/attire.module').then(m => m.AttirePageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }