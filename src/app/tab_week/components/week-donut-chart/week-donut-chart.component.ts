import { Component, ElementRef, ViewChild, AfterViewInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager, IdSetFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router } from '@angular/router';

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

  ngAfterViewInit()
  {
    this.after_init_ = true;

    if (this.tasks.length == 0)
      return;

    this.database_manager_.register_data_updated_callback(this.router_.url + "_donut_chart", async () => {
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
      
      let parent_id_map = new Map<InflatedRecord.ID, number>();
      let goal_parent_id_map = new Map<InflatedRecord.ID, number>();
      let vision_name_map = new Map<string, number>();

      // Get parent IDs
      for (let task of this.tasks)
      {
        if (task.parent_id)
        {
          if (!parent_id_map.has(task.parent_id))
            parent_id_map.set(task.parent_id, 1);
          else
            parent_id_map.set(task.parent_id, parent_id_map.get(task.parent_id) + 1);
        }
      }

      // Get parents
      let parent_id_array = Array.from(parent_id_map.keys());

      if (parent_id_array.length == 0)
      {
        this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data); // Default
        return;
      }  

      let parent_filter = new IdSetFilter(parent_id_array, true);
      let parents = await this.database_manager_.query_nodes([parent_filter]);

      // Extract vision names and counts
      for (let parent of parents)
      {
        if (parent.type == InflatedRecord.Type.VISION)
        {
          vision_name_map.set(parent.name, parent_id_map.get(parent.id));
        }
        else // goal
        {
          if (!goal_parent_id_map.has(parent.parent_id))
            goal_parent_id_map.set(parent.parent_id, parent_id_map.get(parent.id));
          else
            goal_parent_id_map.set(parent.parent_id, goal_parent_id_map.get(parent.parent_id) + parent_id_map.get(parent.id));
        }
      }

      // Get parents 2
      parent_id_array = Array.from(goal_parent_id_map.keys());

      if (parent_id_array.length > 0)
      { 
        parent_filter = new IdSetFilter(parent_id_array, true);
        parents = await this.database_manager_.query_nodes([parent_filter]);

        // Extract vision names and counts
        for (let parent of parents)
        {
          if (!vision_name_map.has(parent.name))
          {
            vision_name_map.set(parent.name, goal_parent_id_map.get(parent.id));
          }
          else
          {
            vision_name_map.set(parent.name, vision_name_map.get(parent.name) + goal_parent_id_map.get(parent.id));
          }
        };
      }

      if (vision_name_map.size == 0)
      {
        this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data); // Default
        return;
      } 

      // Update chart data
      chart_data.data.datasets[0].data = Array.from(vision_name_map.values());
      chart_data.data.datasets[0].backgroundColor = COLORS;
      chart_data.data.labels = Array.from(vision_name_map.keys());
      //chart_data.options.legend.display = true;
      this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data);
    });
  }

  ngOnChanges()
  {
    if (this.after_init_)
      this.ngAfterViewInit();
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback(this.router_.url + "_donut_chart");
  }
}
