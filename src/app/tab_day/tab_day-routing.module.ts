import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewTaskPage } from './pages/new_task/new_task.page';
import { TaskListPage } from './pages/today_tasks/today_tasks.page';
import { ExistingTaskPage } from './pages/existing_task/existing_task.page';

const routes: Routes = [
  { path: '', component: TaskListPage },
  {
    path: 'new_task',
    component: NewTaskPage,
  },
  {
    path: 'existing_task',
    component: ExistingTaskPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabDayRoutingModule {}
