import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekTasksPage } from './pages/week_tasks/week_tasks.page';
import { ConfigureTgvPage } from '../tab_day/pages/configure_tgv/configure_tgv.page';

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
