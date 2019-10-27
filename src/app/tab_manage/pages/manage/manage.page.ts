import { Component } from '@angular/core';
import { DatabaseManager, DatabaseHelper, ExpandedGoal, ExpandedTask, Task, Goal } from 'src/app/providers/database_manager';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'manage-page',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  private expanded_goals_: ExpandedGoal[];
  private expanded_options_array_: boolean[];
  private slide_options_ = {
    initialSlide: 0,
    speed: 400
  };

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    database_manager_.register_data_updated_callback("manage_page", () => {
      this.expanded_goals_ = DatabaseHelper.get_all_expanded_goals(this.database_manager_);

      let new_expanded_options_array = [];
      for (let i = 0; i < this.expanded_goals_.length; i++)
      {
        new_expanded_options_array.push(false);
      }

      this.expanded_options_array_ = new_expanded_options_array;
    });
  }

  goal_show_hide_tasks(index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_options_array_[index] = !this.expanded_options_array_[index];
  }

  add_task_to_goal(index: number)
  {
    // TODO If something changes in another pane.. not good
    let callback_address = this.router_.url + "/new_task_callback";
    this.addressed_transfer_.put(callback_address, (new_task: Task) => {
      new_task.parent_id = this.expanded_goals_[index].unique_id;
      let new_task_id = this.database_manager_.add_task(new_task);
    });

    let input_settings_address = this.router_.url + "/new_task_settings";
    this.addressed_transfer_.put(input_settings_address, { preset_goal: true});
    this.router_.navigate(['new_task'], { relativeTo: this.route_ });
  }

  new_goal()
  {
    // TODO If something changes in another pane.. not good
    let callback_address = this.router_.url + "/new_goal_callback";
    this.addressed_transfer_.put(callback_address, (new_goal: Goal) => {
      this.database_manager_.add_goal(new_goal);
    });

    this.router_.navigate(['new_goal'], { relativeTo: this.route_ });
  }
}
