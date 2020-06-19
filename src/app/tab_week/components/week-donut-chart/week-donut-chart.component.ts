import { Component, ElementRef, ViewChild, AfterViewInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager, IdSetFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router } from '@angular/router';
import { DatabaseInflator } from 'src/app/providers/database_inflator';

@Component({
  selector: 'week-donut-chart',
  templateUrl: './week-donut-chart.component.html',
  styleUrls: ['./week-donut-chart.component.scss'],
})
export class WeekDonutChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("donutCanvas", { static: false }) donut_canvas_: ElementRef;
  @Input() tasks;
  private donut_chart_: Chart;
  private after_init_: boolean;
  
  constructor(private database_manager_: DatabaseManager,
              private router_: Router) {
    this.after_init_ = false;
  }

  update_chart_data()
  {
    // Set default
    let chart_data = {
      type: 'pie',
      data: {
        datasets: [{
          data: [1],
          backgroundColor: []
        }],
      
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: ["None"]
      },
      options: {
        legend: {
        //   display: false
          onClick: null
        },
        title: {
          display: true,
          text: "Vision Distribution"
        }
      }
    }

    const COLORS = ["#003f5c",
                    "#2f4b7c",
                    "#665191",
                    "#a05195",
                    "#d45087",
                    "#f95d6a",
                    "#ff7c43",
                    "#ffa600"];

    if (this.tasks.length == 0)
    {
      this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data); // Default
      return;
    }
  
    // Inflate tasks
    //await DatabaseInflator.upward_inflate(this.tasks, this.database_manager_);
    
    // Count visions
    let vision_name_map = new Map<string, number>();
    
    let add_to_map = (key: string, value: number) => 
    {
      if (!vision_name_map.has(key))
          vision_name_map.set(key, value);
        else
          vision_name_map.set(key, vision_name_map.get(key) + value);
    };

    for (let task of this.tasks)
    {
      if (task.parent != undefined)
      {
        if (task.parent.type == InflatedRecord.Type.VISION)
        {
          add_to_map(task.parent.name, 1);
        }
        else if (task.parent.parent != undefined)
        {
          // Must be a vision
          add_to_map(task.parent.parent.name, 1);
        }
        else  // Unassociated goal
        {
          add_to_map("Unassociated", 1);
        }
      }
      else  // Unassociated task
      {
        add_to_map("Unassociated", 1);
      }
    }

    // Update chart data
    chart_data.data.datasets[0].data = Array.from(vision_name_map.values());
    chart_data.data.datasets[0].backgroundColor = COLORS;
    chart_data.data.labels = Array.from(vision_name_map.keys());
    //chart_data.options.legend.display = true;
    this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data);
  }

  ngAfterViewInit()
  {
    this.after_init_ = true;
    this.update_chart_data();

    //let update_chart_functor = () => { this.update_chart_data() };
    //this.database_manager_.register_data_updated_callback(this.router_.url + "_donut_chart", update_chart_functor);
  }

  ngOnChanges()
  {
    if (this.after_init_)
      this.update_chart_data();
  }

  ngOnDestroy()
  {
    //this.database_manager_.unregister_data_updated_callback(this.router_.url + "_donut_chart");
  }
}
