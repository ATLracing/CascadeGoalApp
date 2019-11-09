import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, ExpandedTask, DatabaseHelper } from 'src/app/providers/database_manager';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'existing-task-page',
  templateUrl: 'existing_task.page.html',
  styleUrls: ['existing_task.page.scss']
})
export class ExistingTaskPage implements OnDestroy {
  private available_tasks_: ExpandedTask[];
  private checkboxes_array_: boolean[];

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute)
  {
    let existing_task_ids = addressed_transfer_.get("existing_task_page_current_task_ids");

    database_manager_.register_data_updated_callback("existing_task_page", () => {
      let all_tasks = database_manager_.get_tasks_ref();
      let available_task_ids = [];

      for (let task of all_tasks)
      {
        if (task.date_completed != undefined || task.date_cancelled != undefined)
          continue
        
        // TODO This is bullshit.. but it is robust
        let is_available = true;
        for (let existing_task_id of existing_task_ids)
        {
          if (task.unique_id == existing_task_id)
          {
            is_available = false;
            break;
          }
        }

        if (is_available)
          available_task_ids.push(task.unique_id);
      }

      this.available_tasks_ = DatabaseHelper.get_expanded_tasks(available_task_ids, this.database_manager_);
      
      let new_checkboxes_array = [];
      for (let i = 0; i < this.available_tasks_.length; ++i)
      {
        new_checkboxes_array.push(false);
      }

      this.checkboxes_array_ = new_checkboxes_array;
    });
  }

  save()
  {
    let available_task_ids = [];

    for (let i = 0; i < this.checkboxes_array_.length; ++i)
    {
      if (this.checkboxes_array_[i])
      {
        available_task_ids.push(this.available_tasks_[i].unique_id)
      }
    }

    this.addressed_transfer_.get("existing_task_page_callback")(available_task_ids);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("existing_task_page");
  }
}
