import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListPage } from './pages/today_tasks/today_tasks.page';
import { TaskListComponent } from './components/task/task';
import { TabDayRoutingModule } from './tab_day-routing.module';
import { ComponentAssociate } from './components/associate/associate';
import { ConfigureTgvPage } from './pages/configure_tgv/configure_tgv.page';
import { DayTaskListItemComponent } from './components/day-task-list-item/day-task-list-item.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabDayRoutingModule
  ],
  entryComponents: [ComponentAssociate],
  declarations: [TaskListPage, ConfigureTgvPage, TaskListComponent, ComponentAssociate, DayTaskListItemComponent]
})
export class TabTasksModule {}
