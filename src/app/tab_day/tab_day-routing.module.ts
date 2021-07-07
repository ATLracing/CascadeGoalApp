import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListPage } from './today_tasks/today_tasks.page';
import { ConfigureTgvPage } from '../core/components/configure_tgv/configure_tgv.page';

const routes: Routes = [
  { path: '', component: TaskListPage },
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
