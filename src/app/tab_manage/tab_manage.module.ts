import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisionsPage } from './pages/visions/visions.page';
import { TabManageRoutingModule } from './tab_manage-router.module';
import { TabTasksModule } from '../tab_day/tab_day.module';
import { GoalListItemComponent } from './components/goal-list-item/goal-list-item.component';
import { SettingsComponent } from './components/settings/settings';
import { ManagePage } from './pages/manage/manage.component';
import { BacklogPage } from './pages/backlog/backlog.component';
import { GoalBacklogPage } from './pages/goal-backlog/goal-backlog.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabManageRoutingModule,
    TabTasksModule,
  ],
  entryComponents: [SettingsComponent],
  declarations: [ManagePage, VisionsPage, BacklogPage, GoalBacklogPage, GoalListItemComponent, SettingsComponent ]
})
export class Tab3PageModule {}
