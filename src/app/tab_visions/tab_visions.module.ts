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

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabManageRoutingModule,
    TabTasksModule,
  ],
  declarations: [ManagePage, NewGoalPage, NewVisionPage]
})
export class Tab3PageModule {}
