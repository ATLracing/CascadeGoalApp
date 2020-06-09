import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, IdSetFilter } from '../../../providers/database_manager';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { CalendarManager } from 'src/app/providers/calendar_manager';

export class AddFromAllExistingInputs
{
  excluded_ids: number[];
}

@Component({
  selector: 'app-add-from-all-existing',
  templateUrl: 'add_from_all_existing.page.html',
  styleUrls: ['add_from_all_existing.page.scss']
})
export class AddFromAllExistingPage implements OnDestroy {
  private goals_: InflatedRecord.Goal[];
  private save_callback_: any;

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute) {    
    this.save_callback_ = this.addressed_transfer_.get_for_route(router_, "callback");

    let inputs = this.addressed_transfer_.get_for_route(router_, "inputs");
    let excluded_ids = inputs.excluded_ids;

    database_manager_.register_data_updated_callback("add_from_all_existing_page", async () => {
      
      let all_tasks = await database_manager_.query_tasks([new IdSetFilter(excluded_ids, false)]);
      this.goals_ = await DatabaseInflator.construct_tree_from_tasks(all_tasks, InflatedRecord.Type.GOAL, database_manager_);

      // Append extra info
      for (let goal of this.goals_)
      {
        goal.extra = { expanded: false };

        for (let task of goal.children)
        {
          task.extra = { selected: false };
        }
      }
    });
  }

  goal_show_hide_tasks(goal_index: number)
  {
    console.log("Show/hide tasks");
    this.goals_[goal_index].extra.expanded = !this.goals_[goal_index].extra.expanded;
  }

  async save()
  {
    let new_task_ids = [];
    
    for (let goal of this.goals_)
    {
      for (let task of goal.children)
      {
        if (task.extra.selected)
        {
          // TODO(ABurroughs): This is extremely inefficient
          InflatedRecord.set_this_week(task);
          await this.database_manager_.task_set_basic_attributes(task, true);
          // Deprecated
          new_task_ids.push(task.id);
        }
      }
    }

    this.database_manager_.manually_trigger_callbacks();

    this.save_callback_(new_task_ids);
    this.router_.navigate(['..'], { relativeTo: this.route_ });
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("add_from_all_existing_page");
  }
}
