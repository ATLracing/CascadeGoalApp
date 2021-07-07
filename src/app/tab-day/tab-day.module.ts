import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodayTasksPage } from './today-tasks-page/today-tasks.page';
import { TabDayRoutingModule } from './tab-day-routing.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabDayRoutingModule,
    CoreModule
  ],
  exports: [],
  entryComponents: [],
  declarations: [TodayTasksPage]
})
export class TabDayModule {}
