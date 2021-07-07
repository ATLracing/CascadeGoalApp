import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekTasksPage } from './week_tasks/week_tasks.page';
import { ConfigureTgvPage } from '../core/components/configure_tgv/configure_tgv.page';

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
