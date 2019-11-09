import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeekTasksPage } from './pages/week_tasks/week_tasks.page';
import { AddFromAllExistingPage } from './pages/add_from_all_existing/add_from_all_existing.page';

const routes: Routes = [
  { 
    path: '', 
    component: WeekTasksPage 
  },
  {
    path: 'add_from_all_existing',
    component: AddFromAllExistingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabWeekRoutingModule{}
