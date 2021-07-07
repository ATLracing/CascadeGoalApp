import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

import { AddressedTransfer } from './providers/addressed_transfer';
import { CalendarManager } from './providers/calendar_manager';
import { DatabaseManager } from './providers/database_manager';

import { ComponentAssociate } from './components/associate/associate';
import { ChangeWeekComponent } from './components/change-week/change-week.component';
import { TaskListItemComponent } from './components/task-list-item/task-list-item.component';
import { TaskListItemPopoverComponent } from './components/task-list-item-popover/task-list-item-popover.component';
import { ConfigureTgvPage } from './components/configure_tgv/configure_tgv.page';
import { GoalListItemComponent } from './components/goal-list-item/goal-list-item.component';

@NgModule({
  declarations: [
    ChangeWeekComponent,
    ComponentAssociate,
    ConfigureTgvPage,
    GoalListItemComponent,
    TaskListItemComponent,
    TaskListItemPopoverComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicStorageModule,
  ],
  exports: [
    ChangeWeekComponent,
    ComponentAssociate,
    ConfigureTgvPage,
    GoalListItemComponent,
    TaskListItemComponent,
    TaskListItemPopoverComponent
  ],
  providers: [
    SQLite,
    SQLitePorter,
    AddressedTransfer,
    CalendarManager,
    DatabaseManager,
  ]
})
export class CoreModule { }
