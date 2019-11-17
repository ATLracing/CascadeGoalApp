import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, Week, Day } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator, ExpandedGoal, GoalFilter, TaskFilter } from 'src/app/providers/database_inflator';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
  styleUrls: ['week_tasks.page.scss']
})
export class WeekTasksPage implements OnDestroy {
  private goals_: ExpandedGoal[];
  private week_: Week;
  private day_: Day;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    
    database_manager_.register_data_updated_callback("this_week_tasks_page", () => {      
      let database_image = database_manager_.get_image_delegate();
      
      this.day_ = database_image.get_most_recent_day();
      this.week_ = database_image.get_week(this.day_.parent_id);
      
      this.goals_ = DatabaseInflator.query_goals(this.database_manager_, GoalFilter.populated(), TaskFilter.including(this.week_.task_ids));

      // Append UI info
      for (let goal of this.goals_)
      {
        goal.extra = { expanded: true };

        for (let task of goal.child_tasks)
        {
          const STYLE_COMPLETE = 'line-through'
          const STYLE_DAY = 'bold'

          let style_complete = task.date_completed != undefined ? STYLE_COMPLETE : undefined
          let style_today = undefined;

          for (let day_id of this.day_.task_ids)
          {
            if (task.unique_id == day_id)
            {
              style_today = STYLE_DAY;
              break;
            }
          }

          task.extra = { 
                         style_complete: style_complete,
                         style_today: style_today
                        };
        }
      }
      console.log(this.goals_);
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
    this.addressed_transfer_.put_for_route(this.router_, "add_from_all_existing", "inputs", { excluded_ids: this.week_.task_ids });

    this.addressed_transfer_.put_for_route(this.router_, "add_from_all_existing", "callback", (new_task_ids: number[]) => {
      console.log(this.week_.task_ids);
      this.week_.task_ids = this.week_.task_ids.concat(new_task_ids);
      console.log(this.week_.task_ids);
      this.database_manager_.set_week(this.week_);
    });

    this.router_.navigate(['add_from_all_existing'], { relativeTo: this.route_} );
  }

  remove(goal_index: number, task_index: number)
  {
    let remove_id = this.goals_[goal_index].child_tasks[task_index].unique_id;
    this.database_manager_.remove_task_from_week(this.week_.unique_id, this.day_.unique_id, remove_id);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
