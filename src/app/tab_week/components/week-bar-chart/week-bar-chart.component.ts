import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager, DateContainsFilter } from 'src/app/providers/database_manager';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { get_this_week, get_today } from 'src/app/providers/discrete_date';

@Component({
  selector: 'week-bar-chart',
  templateUrl: './week-bar-chart.component.html',
  styleUrls: ['./week-bar-chart.component.scss'],
})
export class WeekBarChartComponent implements AfterViewInit, OnChanges {
  @ViewChild("barCanvas", { static: false }) bar_canvas_: ElementRef;
  @Input() tasks;
  private bar_chart_: Chart;
  private after_init_: boolean;
  
  constructor() {
    this.after_init_ = false;
  }

  ngAfterViewInit()
  {
    const BACKGROUND_COLOR = "rgba(0, 0, 0, 0.2)";
    const BORDER_COLOR = "rgba(0, 0, 0, 0.3)";
    const BACKGROUND_COLOR_TODAY = "rgba(42, 155, 255, 0.2)";
    const BORDER_COLOR_TODAY = "rgba(42, 155, 255, 0.3)";

    let week_filter = new DateContainsFilter(get_this_week());

    // TODO(ABurroughs): Should be for route
    let chart_data = {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Completed Tasks",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: [
              BACKGROUND_COLOR,
              BACKGROUND_COLOR,
              BACKGROUND_COLOR,
              BACKGROUND_COLOR,
              BACKGROUND_COLOR,
              BACKGROUND_COLOR,
              BACKGROUND_COLOR
            ],
            borderColor: [
              BORDER_COLOR,
              BORDER_COLOR,
              BORDER_COLOR,
              BORDER_COLOR,
              BORDER_COLOR,
              BORDER_COLOR,
              BORDER_COLOR
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                precision: 0,
                beginAtZero: true
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Completed Tasks"
        }
      }
    };

    // Obtain # completed tasks for each day of the week
    for (let task of this.tasks)
    {
      if (InflatedRecord.is_active(task) || task.resolution != InflatedRecord.Resolution.COMPLETE)
      {
        continue;
      }

      let index = task.discrete_date_completed.day;
      chart_data.data.datasets[0].data[index]++;
    }

    // Set today's color
    let today_index = get_today().day;
    chart_data.data.datasets[0].backgroundColor[today_index] = BACKGROUND_COLOR_TODAY;
    chart_data.data.datasets[0].borderColor[today_index] = BORDER_COLOR_TODAY;
    
    this.bar_chart_ = new Chart(this.bar_canvas_.nativeElement, chart_data);
    
    this.after_init_ = true;
  }

  ngOnChanges()
  {
    if (this.after_init_)
      this.ngAfterViewInit();
  }
}
