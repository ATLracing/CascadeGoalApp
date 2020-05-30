import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, WeekFilter } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import * as Util from 'src/app/providers/util';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
  styleUrls: ['week_tasks.page.scss']
})
export class WeekTasksPage implements OnDestroy {
  private tasks_: InflatedRecord.Task[];
  private goals_: InflatedRecord.Goal[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    
    database_manager_.register_data_updated_callback("this_week_tasks_page", async () => {            
      // Get the current week
      let week_number = CalendarManager.get_iso_week();
      
      // Query all tasks for the week
      let week_filter = new WeekFilter(week_number);
      this.tasks_ = await database_manager_.query_tasks([week_filter]);
      
      this.goals_ = await DatabaseInflator.construct_tree_from_tasks(this.tasks_, InflatedRecord.Type.GOAL, this.database_manager_);
      
      // Append UI info
      for (let goal of this.goals_)
      {
        goal.extra = { expanded: true };

        for (let task of goal.children)
        {
          const STYLE_COMPLETE = 'line-through'
          const STYLE_DAY = 'bold'

          let style_complete = !InflatedRecord.is_active(task) ? STYLE_COMPLETE : undefined

          let day_number = CalendarManager.get_day_of_week();
          let style_today = day_number == task.day ? STYLE_DAY : undefined;

          task.extra = { 
                         style_complete: style_complete,
                         style_today: style_today
                        };
        }
      }
    });
  }

  goal_show_hide_tasks(goal_index: number)
  {
    console.log("Show/hide tasks");
    this.goals_[goal_index].extra.expanded = !this.goals_[goal_index].extra.expanded;
  }

  add_new_task()
  {
  }

  add_existing_task()
  {
    console.log("Existing task");
    
    // Collect task IDs
    let week_task_ids = [];
    
    for (let task of this.tasks_)
    {
      week_task_ids.push(task.id);
    }
    
    this.addressed_transfer_.put_for_route(this.router_, "add_from_all_existing", "inputs", { excluded_ids: week_task_ids });

    this.addressed_transfer_.put_for_route(this.router_, "add_from_all_existing", "callback", (new_task_ids: number[]) => {
      // Deprecated
    });

    this.router_.navigate(['add_from_all_existing'], { relativeTo: this.route_} );
  }

  async remove(goal_index: number, task_index: number)
  {
    let remove_task = this.goals_[goal_index].children[task_index];
    
    remove_task.day = InflatedRecord.NULL_DAY;
    remove_task.week = InflatedRecord.NULL_WEEK;

    await this.database_manager_.task_set_basic_attributes(remove_task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
