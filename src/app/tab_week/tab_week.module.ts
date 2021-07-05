import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeekTasksPage } from './pages/week_tasks/week_tasks.page';
import { TabWeekRoutingModule } from './tab_week-router.module';
import { TabTasksModule } from '../tab_day/tab_day.module';
import { WeekBarChartComponent } from './components/week-bar-chart/week-bar-chart.component';
import { WeekDonutChartComponent } from './components/week-donut-chart/week-donut-chart.component';
import { ProgressGraphComponent } from './components/progress-graph/progress-graph.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabWeekRoutingModule,
    TabTasksModule
  ],
  declarations: [ WeekTasksPage, WeekBarChartComponent, WeekDonutChartComponent, ProgressGraphComponent]
})
export class TabWeekModule {}
