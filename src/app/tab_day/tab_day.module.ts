import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskListPage } from './pages/today_tasks/today_tasks.page';
import { TaskListComponent } from './components/task/task';
import { TabDayRoutingModule } from './tab_day-routing.module';
import { NewTaskPage } from './pages/new_task/new_task.page';
import { ExistingTaskPage } from './pages/existing_task/existing_task.page';
import { ComponentAssociate } from './components/associate/associate';
import { ConfigureTgvPage } from './pages/configure_tgv/configure_tgv.page';
import { ComponentSetCompletion } from './components/set_completion/set_completion';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabDayRoutingModule
  ],
  entryComponents: [ComponentAssociate, ComponentSetCompletion],
  declarations: [TaskListPage, ConfigureTgvPage, NewTaskPage, ExistingTaskPage, TaskListComponent, ComponentAssociate, ComponentSetCompletion]
})
export class TabTasksModule {}
