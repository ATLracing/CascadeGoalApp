import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager, WeekFilter } from 'src/app/providers/database_manager';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'

@Component({
  selector: 'week-bar-chart',
  templateUrl: './week-bar-chart.component.html',
  styleUrls: ['./week-bar-chart.component.scss'],
})
export class WeekBarChartComponent implements AfterViewInit {
  @ViewChild("barCanvas", { static: false }) bar_canvas_: ElementRef;
  private bar_chart_: Chart;
  
  constructor(private database_manager_: DatabaseManager) {}

  ngAfterViewInit()
  {
    const BACKGROUND_COLOR = "rgba(0, 0, 0, 0.2)";
    const BORDER_COLOR = "rgba(0, 0, 0, 0.3)";
    const BACKGROUND_COLOR_TODAY = "rgba(42, 155, 255, 0.2)";
    const BORDER_COLOR_TODAY = "rgba(42, 155, 255, 0.3)";

    let week_filter = new WeekFilter(CalendarManager.get_iso_week());

    // TODO(ABurroughs): Should be for route
    this.database_manager_.register_data_updated_callback("chart_update_callback", async () => {
      let tasks = await this.database_manager_.query_tasks([week_filter]);
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
      for (let task of tasks)
      {
        if (InflatedRecord.is_active(task) || task.resolution != InflatedRecord.Resolution.COMPLETE)
        {
          continue;
        }

        let index = CalendarManager.get_day_of_week_from_date(task.date_closed);
        chart_data.data.datasets[0].data[index]++;
      }

      // Set today's color
      let today_index = CalendarManager.get_day_of_week();
      chart_data.data.datasets[0].backgroundColor[today_index] = BACKGROUND_COLOR_TODAY;
      chart_data.data.datasets[0].borderColor[today_index] = BORDER_COLOR_TODAY;
      
      this.bar_chart_ = new Chart(this.bar_canvas_.nativeElement, chart_data);
    });
  }
}
