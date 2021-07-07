import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab-day/tab-day.module').then(m => m.TabDayModule)
      },
      {
        path: 'tab2',
        loadChildren: () => import('../tab-week/tab-week.module').then(m => m.TabWeekModule)
      },
      {
        path: 'tab3',
        loadChildren: () => import('../tab-manage/tab-manage.module').then(m => m.TabManageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
