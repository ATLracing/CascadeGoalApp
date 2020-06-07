import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagePage } from './pages/manage/manage.page';
import { TabManageRoutingModule } from './tab_visions-router.module';
import { TabTasksModule } from '../tab_day/tab_day.module';
import { NewGoalPage } from './pages/new_goal/new_goal.page';
import { NewVisionPage } from './pages/new_vision/new_vision.page';
import { GoalListItemComponent } from './components/goal-list-item/goal-list-item.component';
import { TaskListItemComponent } from './components/task-list-item/task-list-item.component';
import { SettingsComponent } from './components/settings/settings';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabManageRoutingModule,
    TabTasksModule,
  ],
  entryComponents: [SettingsComponent],
  declarations: [ManagePage, NewGoalPage, NewVisionPage, GoalListItemComponent, TaskListItemComponent, SettingsComponent ]
})
export class Tab3PageModule {}
