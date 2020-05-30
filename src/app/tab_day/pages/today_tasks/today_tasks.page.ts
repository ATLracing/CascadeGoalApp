import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, DayFilter } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import * as Util from 'src/app/providers/util';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})
export class TaskListPage implements OnDestroy {
  private day_tasks_: InflatedRecord.Task[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    database_manager_.register_data_updated_callback("today_tasks_page", async () => {      
    
    let day_number = CalendarManager.get_day_of_week();
    let week_number = CalendarManager.get_iso_week();

    let day_filter = new DayFilter(day_number, week_number);
    this.day_tasks_ = await database_manager_.query_tasks([day_filter]);

      // Append extra info
      for (let task of this.day_tasks_)
      {
        task.extra.completed = task.date_closed != InflatedRecord.NULL_DATE;

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
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', (new_task: InflatedRecord.Task) => {
      // Add new task
      this.database_manager_.task_add(new_task);      
    });

    this.router_.navigate(['new_task'], { relativeTo: this.route_} );
  }

  add_existing_task()
  {
    console.log("Existing task");
    
    let day_task_ids = [];
    for (let task of this.day_tasks_)
    {
      day_task_ids.push(task.id);
    }
    
    this.addressed_transfer_.put("existing_task_page_current_task_ids", day_task_ids);
    this.addressed_transfer_.put("existing_task_page_callback", (new_task_ids: InflatedRecord.ID[]) => {
      // TODO
    });

    this.router_.navigate(['existing_task'], { relativeTo: this.route_} );
  }

  checkbox_change(index: number)
  {
    let task = this.day_tasks_[index];
    this.database_manager_.task_toggle_completion(task.id);
  }

  remove(index: number)
  {
    console.log("Remove: " + index);
    let remove_task = this.day_tasks_[index];

    remove_task.day = InflatedRecord.NULL_DAY;

    this.database_manager_.task_set_basic_attributes(remove_task);
  }
}
