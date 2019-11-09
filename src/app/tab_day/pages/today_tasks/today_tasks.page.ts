import { Component, OnDestroy } from '@angular/core';
import { Task, DatabaseManager, Day, ExpandedTask, DatabaseHelper, TaskFilter, Week } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})
export class TaskListPage implements OnDestroy {
  private tasks_: ExpandedTask[];
  private day_: Day;
  private checkboxes_array_: boolean[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    database_manager_.register_data_updated_callback("today_tasks_page", () => {
      // TODO: Figure out the most recent day
      let days = database_manager_.get_days_copy();      
      this.day_ = days[days.length - 1];

      this.tasks_ = DatabaseHelper.query_tasks(this.database_manager_, TaskFilter.including(this.day_.task_ids));

      let new_checkboxes_array = [];
      for (let i = 0; i < this.tasks_.length; ++i)
      {
        new_checkboxes_array.push(false);
      }

      this.checkboxes_array_ = new_checkboxes_array;
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
      this.day_.task_ids.push(new_task_id);
      this.database_manager_.set_day(this.day_);
    });

    this.router_.navigate(['new_task'], { relativeTo: this.route_} );
  }

  add_existing_task()
  {
    console.log("Existing task");
    this.addressed_transfer_.put("existing_task_page_current_task_ids", this.day_.task_ids);
    this.addressed_transfer_.put("existing_task_page_callback", (new_task_ids: number[]) => {
      this.day_.task_ids = this.day_.task_ids.concat(new_task_ids);
      this.database_manager_.set_day(this.day_);
    });

    this.router_.navigate(['existing_task'], { relativeTo: this.route_} );
  }
}
