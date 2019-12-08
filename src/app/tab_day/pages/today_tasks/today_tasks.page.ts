import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import * as Util from 'src/app/providers/util';
import { TaskFilter } from 'src/app/providers/database_inflator'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})
export class TaskListPage implements OnDestroy {
  private day_: InflatedRecord.Day;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    database_manager_.register_data_updated_callback("today_tasks_page", () => {      
      let day = database_manager_.get_most_recent_day();
      this.day_ = new InflatedRecord.Day(day, 
                                         TaskFilter.all(), 
                                         database_manager_);

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

  ngOnDestroy()
  {
    console.log("Destroyed");
  }

  add_new_task()
  {
    console.log("New task");
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', (new_task: PackedRecord.Task) => {
      // Add new task
      let new_task_id = this.database_manager_.task_add(new_task.name, new_task.details, CalendarManager.get_date(), PackedRecord.DateIncomplete, PackedRecord.GROUP_LOCAL, true);
      
      // Set task parent
      if (new_task.parent_id != PackedRecord.NullID)
      {
        this.database_manager_.task_set_parent(new_task_id, new_task.parent_id, true);
      }

      // Add the task to the day
      this.day_.task_ids.push(new_task_id);
      this.database_manager_.day_set_task_ids(this.day_.unique_id, this.day_.task_ids);
    });

    this.router_.navigate(['new_task'], { relativeTo: this.route_} );
  }

  add_existing_task()
  {
    console.log("Existing task");
    this.addressed_transfer_.put("existing_task_page_current_task_ids", this.day_.task_ids);
    this.addressed_transfer_.put("existing_task_page_callback", (new_task_ids: PackedRecord.TaskID[]) => {
      let concat_task_id_array = this.day_.task_ids.concat(new_task_ids);
      this.database_manager_.day_set_task_ids(this.day_.unique_id, concat_task_id_array);
    });

    this.router_.navigate(['existing_task'], { relativeTo: this.route_} );
  }

  checkbox_change(index: number)
  {
    let task = this.day_.tasks[index];
    this.database_manager_.task_toggle_completion(task.unique_id);
  }

  remove(index: number)
  {
    console.log("Remove: " + index);
    this.day_.tasks.splice(index, 1);
    let new_day_task_ids = Util.record_array_to_id_array(this.day_.tasks);

    this.database_manager_.day_set_task_ids(this.day_.unique_id, new_day_task_ids);
  }
}
