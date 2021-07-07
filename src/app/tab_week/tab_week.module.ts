import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeekTasksPage } from './week_tasks/week_tasks.page';
import { TabWeekRoutingModule } from './tab_week-router.module';
import { WeekBarChartComponent } from './week-bar-chart/week-bar-chart.component';
import { WeekDonutChartComponent } from './week-donut-chart/week-donut-chart.component';
import { ProgressGraphComponent } from './progress-graph/progress-graph.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabWeekRoutingModule,
    CoreModule
  ],
  declarations: [ WeekTasksPage, WeekBarChartComponent, WeekDonutChartComponent, ProgressGraphComponent]
})
export class TabWeekModule {}
