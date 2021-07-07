import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekTasksPage } from './week-tasks-page/week-tasks.page';
import { ConfigureTgvPage } from '../core/components/configure-tgv-page/configure-tgv.page';

const routes: Routes = [
  { path: '', component: WeekTasksPage 
  },
  {
    path: 'configure_tgv',
    component: ConfigureTgvPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabWeekRoutingModule{}
