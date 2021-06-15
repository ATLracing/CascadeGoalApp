import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListPage } from './pages/today_tasks/today_tasks.page';
import { TaskListComponent } from './components/task/task';
import { TabDayRoutingModule } from './tab_day-routing.module';
import { ComponentAssociate } from './components/associate/associate';
import { ConfigureTgvPage } from './pages/configure_tgv/configure_tgv.page';
import { ChangeWeekComponent } from './components/change-week/change-week.component';
import { TaskListItemComponent } from './components/task-list-item/task-list-item.component';
import { TaskListItemPopoverComponent } from './components/task-list-item-popover/task-list-item-popover.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabDayRoutingModule
  ],
  exports: [TaskListItemComponent],
  entryComponents: [ComponentAssociate, ChangeWeekComponent, TaskListItemPopoverComponent],
  declarations: [TaskListPage, 
                 ConfigureTgvPage, 
                 TaskListComponent, 
                 ComponentAssociate, 
                 ChangeWeekComponent, 
                 TaskListItemComponent,
                 TaskListItemPopoverComponent]
})
export class TabTasksModule {}
