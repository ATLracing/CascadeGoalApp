import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeekTasksPage } from './pages/week_tasks/week_tasks.page';
import { AddFromAllExistingPage } from './pages/add_from_all_existing/add_from_all_existing.page';
import { TabWeekRoutingModule } from './tab_week-router.module';
import { TabTasksModule } from '../tab_day/tab_day.module';
import { WeekTaskListItemComponent } from './components/task-list-item/week-task-list-item.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabWeekRoutingModule,
    TabTasksModule
  ],
  declarations: [ WeekTasksPage, AddFromAllExistingPage, WeekTaskListItemComponent]
})
export class TabWeekModule {}
