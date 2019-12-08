import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator, GoalFilter, TaskFilter } from 'src/app/providers/database_inflator';

export class NewTaskPageSettings
{
  preset_goal: boolean;
}

@Component({
  selector: 'new-task-page',
  templateUrl: 'new_task.page.html',
  styleUrls: ['new_task.page.scss']
})
export class NewTaskPage implements OnDestroy {
  private all_goals_: InflatedRecord.Goal[];
  private new_task_: PackedRecord.Task;
  private goal_parent_id_string_: string;
  private input_settings_: NewTaskPageSettings;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.input_settings_ = this.addressed_transfer_.get_for_route(router_, "settings");
    if (this.input_settings_ == undefined)
      this.input_settings_ = new NewTaskPageSettings();

    database_manager_.register_data_updated_callback("new_task_page", () => {
      this.all_goals_ = DatabaseInflator.query_goals(database_manager_, GoalFilter.all(), TaskFilter.none());

      // Add stringified key
      for (let goal of this.all_goals_)
      {
        goal.extra = { string_key: JSON.stringify(goal.unique_id) };
      }
    });

    this.new_task_ = new PackedRecord.Task();
    console.log("New Task constructed");
  }

  save()
  {
    // TODO(ABurroughs): This sucks
    if (this.goal_parent_id_string_)
      this.new_task_.parent_id = JSON.parse(this.goal_parent_id_string_);
      
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_task_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_task_page");
  }
}
