import { Component, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';

const VISION_COLORS = ["#6929c4",
                       "#1192e8",
                       "#005d5d",
                       "#9f1853",
                       "#fa4d56",
                       "#570408",
                       "#198038",
                       "#002d9c",
                       "#ee538b",
                       "#b28600",
                       "#009d9a",
                       "#012749",
                       "#8a3800",
                       "#a56eff"];

const UNASSOCIATED_COLOR = "#0000001A";

@Component({
  selector: 'week-donut-chart',
  templateUrl: './week-donut-chart.component.html',
  styleUrls: ['./week-donut-chart.component.scss'],
})
export class WeekDonutChartComponent implements AfterViewInit, OnChanges {
  @ViewChild("donutCanvas", { static: false }) donut_canvas_: ElementRef;
  @Input() tasks;
  private donut_chart_: Chart;
  private after_init_: boolean;
  
  constructor(private database_manager_: DatabaseManager) {
    this.after_init_ = false;
  }

  async update_chart_data()
  {
    // Count tasks under each vision
    let vision_task_count_map = new Map<string, number>();
    let num_unassociated = 0;
    
    let add_to_map = (key: InflatedRecord.Vision, value: number) => 
    {
      let key_str = JSON.stringify(key, (key, value) => {
        if (key == "parent" || key == "children")
        {
          return null;
        }
        return value;
      });

      if (!vision_task_count_map.has(key_str))
        vision_task_count_map.set(key_str, value);
      else
        vision_task_count_map.set(key_str, vision_task_count_map.get(key_str) + value);
    };

    for (let task of this.tasks)
    {
      if (task.parent != undefined)
      {
        if (task.parent.type == InflatedRecord.Type.VISION)
        {
          add_to_map(task.parent, 1);
        }
        else if (task.parent.parent != undefined)
        {
          // Must be a vision
          add_to_map(task.parent.parent, 1);
        }
        else  // Unassociated goal
        {
          num_unassociated++;
        }
      }
      else  // Unassociated task
      {
        num_unassociated++;
      }
    }

    // Convert map to array
    let vision_task_count_array = Array.from(vision_task_count_map, ([key, value]) => ({ key: JSON.parse(key), value: value }));

    // Sort by vision ID
    vision_task_count_array.sort((a, b) => a.key.id - b.key.id)

    // Create corresponding label, data, and color arrays
    let labels = num_unassociated > 0 ? ["Unassociated"] : [];
    let data = num_unassociated > 0 ? [num_unassociated] : [];
    let colors = num_unassociated > 0 ? [UNASSOCIATED_COLOR] : [];

    // Get color map
    let color_map = await this.get_vision_color_map();

    for (let kv_pair of vision_task_count_array)
    {
      labels.push(kv_pair.key.name);
      data.push(kv_pair.value);
      colors.push(color_map.get(kv_pair.key.id))
    }

    // Create chart
    let chart_data = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors
        }],
      },
      options: {
        legend: {
        //   display: false
          onClick: null,
          position: "bottom"
        },
        title: {
          display: true,
          text: "Vision Distribution"
        }
      }
    }

    this.donut_chart_ = new Chart(this.donut_canvas_.nativeElement, chart_data);
  }

  async get_vision_color_map() : Promise<Map<InflatedRecord.ID, string>>
  {
    // Query all visions
    let all_visions = await this.database_manager_.query_visions();

    // Sort visions by ID
    all_visions.sort((a, b) => a.id - b.id);

    // Map vision IDs to colors
    let color_map = new Map<InflatedRecord.ID, string>();
    let i = 0;
    for (let vision of all_visions)
    {
      color_map.set(vision.id, VISION_COLORS[i]);
      i = (i + 1) % VISION_COLORS.length;
    }

    return color_map;
  }

  async ngAfterViewInit()
  {
    await this.update_chart_data();
    this.after_init_ = true;
  }

  async ngOnChanges()
  {
    if (this.after_init_)
      await this.update_chart_data();
  }
}
