import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, ExpandedGoal, DatabaseHelper, TaskFilter, GoalFilter } from '../../../providers/database_manager';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';

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
  private goals_: ExpandedGoal[];
  private save_callback_: any;

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute) {    
    this.save_callback_ = this.addressed_transfer_.get_for_route(router_, "callback");

    let inputs = this.addressed_transfer_.get_for_route(router_, "inputs");
    let excluded_ids = inputs.excluded_ids;

    database_manager_.register_data_updated_callback("add_from_all_existing_page", () => {
      this.goals_ = DatabaseHelper.query_goals(this.database_manager_, GoalFilter.populated(), TaskFilter.excluding(excluded_ids));

      // Append extra info
      for (let goal of this.goals_)
      {
        goal.extra = { expanded: false };

        for (let task of goal.child_tasks)
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

  save()
  {
    let new_task_ids = [];
    
    for (let goal of this.goals_)
    {
      for (let task of goal.child_tasks)
      {
        if (task.extra.selected)
        {
          new_task_ids.push(task.unique_id);
        }
      }
    }

    this.save_callback_(new_task_ids);
    this.router_.navigate(['..'], { relativeTo: this.route_ });
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("add_from_all_existing_page");
  }
}
