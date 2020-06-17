import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager, DateContainsFilter } from 'src/app/providers/database_manager';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { get_this_week, get_today, contains, prior_to, get_level, DiscreteDateLevel } from 'src/app/providers/discrete_date';

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
    const BACKGROUND_COLOR = "#6996b3";
    const BORDER_COLOR = "#6996b3";
    const BACKGROUND_COLOR_TODAY = "#004c6d";
    const BORDER_COLOR_TODAY = "#004c6d";
    const REMAINING_COLOR = "rgba(0, 0, 0, 0.1)";
    const REMAINING_BORDER_COLOR = REMAINING_COLOR;
    const OVERDUE_COLOR = "#ffa600";
    const OVERDUE_BORDER_COLOR = OVERDUE_COLOR;

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
          },
          {
            label: "Remaining Tasks",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: [
              OVERDUE_COLOR,
              OVERDUE_COLOR,
              OVERDUE_COLOR,
              OVERDUE_COLOR,
              OVERDUE_COLOR,
              OVERDUE_COLOR,
              OVERDUE_COLOR
            ],
            borderColor: [
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR,
              OVERDUE_BORDER_COLOR
            ],
            borderWidth: 0
          }
        ],
      },
      options: {
        scales: {
          xAxes: [
            {
              stacked: true,
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
    let today = get_today();
    let today_index = today.day;

    for (let task of this.tasks)
    {
      // All completed tasks are marked in the first dataset
      if (task.resolution == InflatedRecord.Resolution.COMPLETE)
      {
        let index = task.discrete_date_completed.day;
        chart_data.data.datasets[0].data[index]++;
      }
      // Add late and remaining tasks
      else if (get_level(task.discrete_date) == DiscreteDateLevel.DAY)
      {
        // If the due date is this week, add it
        if (contains(task.discrete_date, get_this_week()))
        {
          let index = task.discrete_date.day;
          chart_data.data.datasets[1].data[index]++;
        }

        // If overdue, add to today
        if (prior_to(task.discrete_date, today))
        {
          chart_data.data.datasets[1].data[today_index]++;
        }
      }
    }

    // Stack datasets
    for (let i = 0; i < 7; i++)
    {
      chart_data.data.datasets[1].data[i] += chart_data.data.datasets[0].data[i];
    }

    // Set today's color
    chart_data.data.datasets[0].backgroundColor[today_index] = BACKGROUND_COLOR_TODAY;
    chart_data.data.datasets[0].borderColor[today_index] = BORDER_COLOR_TODAY;
    
    chart_data.data.datasets[1].backgroundColor[today_index] = REMAINING_COLOR;
    chart_data.data.datasets[1].borderColor[today_index] = REMAINING_BORDER_COLOR;

    this.bar_chart_ = new Chart(this.bar_canvas_.nativeElement, chart_data);
    
    this.after_init_ = true;
  }

  ngOnChanges()
  {
    if (this.after_init_)
      this.ngAfterViewInit();
  }
}
