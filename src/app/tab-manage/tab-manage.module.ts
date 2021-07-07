import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisionsPage } from './visions-page/visions.page';
import { TabManageRoutingModule } from './tab-manage-router.module';
import { SettingsComponent } from './settings/settings';
import { ManagePage } from './manage-page/manage.page';
import { BacklogPage } from './backlog-page/backlog.component';
import { GoalBacklogPage } from './goal-backlog-page/goal-backlog.component';
import { CalendarPage } from './calendar-page/calendar.component';
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
export class TabManageModule {}
