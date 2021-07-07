import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisionsPage } from './visions/visions.page';
import { TabManageRoutingModule } from './tab_manage-router.module';
import { SettingsComponent } from './settings/settings';
import { ManagePage } from './manage/manage.component';
import { BacklogPage } from './backlog/backlog.component';
import { GoalBacklogPage } from './goal-backlog/goal-backlog.component';
import { CalendarPage } from './calendar/calendar.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabManageRoutingModule,
    CoreModule
  ],
  entryComponents: [SettingsComponent],
  declarations: [ManagePage, VisionsPage, BacklogPage, GoalBacklogPage, CalendarPage, SettingsComponent ]
})
export class Tab3PageModule {}
