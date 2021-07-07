import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListPage } from './today_tasks/today_tasks.page';
import { TabDayRoutingModule } from './tab_day-routing.module';
import { TaskListItemComponent } from '../core/components/task-list-item/task-list-item.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabDayRoutingModule,
    CoreModule
  ],
  exports: [TaskListItemComponent],
  entryComponents: [],
  declarations: [TaskListPage]
})
export class TabTasksModule {}
