import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagePage } from './pages/manage/manage.page';
import { NewTaskPage } from '../tab_day/pages/new_task/new_task.page';
import { NewGoalPage } from './pages/new_goal/new_goal.page';
import { NewVisionPage } from './pages/new_vision/new_vision.page';
import { ConfigureTgvPage } from '../tab_day/pages/configure_tgv/configure_tgv.page';

const routes: Routes = [
  { path: '', component: ManagePage},
  {
    path: 'new_task',
    component: NewTaskPage,
  },
  {
    path: 'new_goal',
    component: NewGoalPage,
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
export class TabManageRoutingModule{}
