import { Component, OnDestroy } from '@angular/core';
import { Task, DatabaseManager, Day } from 'src/app/providers/database_manager';
import { DatabaseInflator, ExpandedTask, TaskFilter, ExpandedDay } from 'src/app/providers/database_inflator'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})
export class TaskListPage implements OnDestroy {
  private day_: ExpandedDay;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    database_manager_.register_data_updated_callback("today_tasks_page", () => {
      let database_image = database_manager_.get_image_delegate();
      
      // TODO: Figure out the most recent day
      let day = database_image.get_most_recent_day();
      this.day_ = new ExpandedDay(day, TaskFilter.all(), database_manager_.get_image_delegate());

      // Append extra info
      for (let task of this.day_.tasks)
      {
        let completed = task.date_completed != undefined;
        task.extra.completed = completed;

        if (task.extra.carried)
        {
          task.extra.style = {'color': 'orange'}
        }
        else
        {
          task.extra.style = {};
        }
      }
    });
  }

  receive_modified_task(task: Task[])
  {
  }

  ngOnDestroy()
  {
    console.log("Destroyed");
  }

  add_new_task()
  {
    console.log("New task");
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', (new_task: Task) => {
      let new_task_id = this.database_manager_.add_task(new_task, true);
      this.database_manager_.add_task_to_day(this.day_.unique_id, new_task_id);
    });

    this.router_.navigate(['new_task'], { relativeTo: this.route_} );
  }

  add_existing_task()
  {
    console.log("Existing task");
    this.addressed_transfer_.put("existing_task_page_current_task_ids", this.day_.task_ids);
    this.addressed_transfer_.put("existing_task_page_callback", (new_task_ids: number[]) => {
      this.database_manager_.add_tasks_to_day(this.day_.unique_id, new_task_ids);
    });

    this.router_.navigate(['existing_task'], { relativeTo: this.route_} );
  }

  checkbox_change(index: number)
  {
    let task = this.day_.tasks[index];
    this.database_manager_.toggle_task_completion(task.unique_id);
  }

  remove(index: number)
  {
    let remove_id = this.day_.tasks[index].unique_id;
    this.database_manager_.remove_task_from_day(this.day_.unique_id, remove_id);
  }
}
