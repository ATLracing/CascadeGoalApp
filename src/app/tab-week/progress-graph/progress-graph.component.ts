import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { get_today } from 'src/app/core/providers/discrete-date';
import { is_complete } from 'src/app/core/providers/inflated-record';

@Component({
  selector: 'progress-graph',
  templateUrl: './progress-graph.component.html',
  styleUrls: ['./progress-graph.component.scss'],
})
export class ProgressGraphComponent implements AfterViewInit, OnChanges {
  @ViewChild("canvas", { static: false }) canvas_: ElementRef;
  @Input() tasks;
  
  private progress_graph_ : Chart;
  private after_init_: boolean;
  
  constructor() {
    this.after_init_ = false;
  }

  ngAfterViewInit() {
    // Count the number of tasks completed each day
    let completed_by_day = [0, 0, 0, 0, 0, 0, 0];
    for (let task of this.tasks)
    {
      if (is_complete(task))
      {
        completed_by_day[task.discrete_date_completed.day] += 1;
      }
    }

    // Determine the number of remaining tasks at the beginning/end of each day
    let x_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let today_index = get_today().day;
    let total_tasks = this.tasks.length;
    let remaining_tasks_line = [];

    for (let i = 0; i <= today_index; ++i)
    {
      let day = x_labels[i];

      remaining_tasks_line.push({x: day, y: total_tasks});
      total_tasks -= completed_by_day[i];
      remaining_tasks_line.push({x: day, y: total_tasks});
    }

    let chart_data = {
      type: "line",
      data: {
        labels: x_labels,
        datasets: [
          {
            pointRadius: 0,

            data: [ {x: "Mon", y: this.tasks.length}, {x: "Sun", y: 0} ]
          },
          {
            tension: 0,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary'),
            backgroundColor: "#00000000",
            pointRadius: 0,

            data: remaining_tasks_line,
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
          display: false,
        },
        events: [],
        title: {
          display: true,
          text: "Burndown"
        }
      }
    };

    this.progress_graph_ = new Chart(this.canvas_.nativeElement, chart_data);
    this.after_init_ = true;
  }

  ngOnChanges()
  {
    if (this.after_init_)
      this.ngAfterViewInit();
  }
}
