import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

import { AddressedTransfer } from './providers/addressed-transfer';
import { CalendarManager } from './providers/calendar-manager';
import { DatabaseManager } from './providers/database-manager';

import { AssociateComponent } from './components/associate/associate.component';
import { ChangeWeekComponent } from './components/change-week/change-week.component';
import { ConfigureTgvPage } from './components/configure-tgv-page/configure-tgv.page';
import { GoalListItemComponent } from './components/goal-list-item/goal-list-item.component';
import { TaskListItemComponent } from './components/task-list-item/task-list-item.component';
import { TaskListItemPopoverComponent } from './components/task-list-item-popover/task-list-item-popover.component';

@NgModule({
  declarations: [
    AssociateComponent,
    ChangeWeekComponent,
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
    AssociateComponent,
    ChangeWeekComponent,
    ConfigureTgvPage,
    GoalListItemComponent,
    TaskListItemComponent,
    TaskListItemPopoverComponent
  ],
  entryComponents: [
    AssociateComponent,
    ChangeWeekComponent,
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
