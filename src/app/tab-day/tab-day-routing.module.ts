import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodayTasksPage } from './today-tasks-page/today-tasks.page';
import { ConfigureTgvPage } from '../core/components/configure-tgv-page/configure-tgv.page';

const routes: Routes = [
  { path: '', component: TodayTasksPage },
  {
    path: 'configure_tgv',
    component: ConfigureTgvPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabDayRoutingModule {}
