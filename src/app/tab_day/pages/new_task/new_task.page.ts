import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, Goal, Task, DatabaseHelper } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

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
  private all_goals_: Goal[];
  private new_task_: Task;
  private goal_parent_id_string_;
  private input_settings_: NewTaskPageSettings;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.input_settings_ = this.addressed_transfer_.get(router_.url + "_settings");
    if (this.input_settings_ == undefined)
      this.input_settings_ = new NewTaskPageSettings();

    database_manager_.register_data_updated_callback("new_task_page", () => {
      this.all_goals_ = database_manager_.get_goals_copy(); // TODO: Needed for updates?
    });

    this.new_task_ = DatabaseHelper.create_blank_task();
    console.log("New Task constructed");
  }

  save()
  {
    // TODO(ABurroughs): This sucks
    this.new_task_.parent_id = parseInt(this.goal_parent_id_string_);
    this.addressed_transfer_.get(this.router_.url + "_callback")(this.new_task_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_task_page");
  }
}
