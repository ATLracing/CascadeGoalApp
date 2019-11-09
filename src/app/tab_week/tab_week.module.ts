import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeekTasksPage } from './pages/week_tasks/week_tasks.page';
import { AddFromAllExistingPage } from './pages/add_from_all_existing/add_from_all_existing.page';
import { TabWeekRoutingModule } from './tab_week-router.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabWeekRoutingModule
  ],
  declarations: [ WeekTasksPage, AddFromAllExistingPage ]
})
export class TabWeekModule {}
