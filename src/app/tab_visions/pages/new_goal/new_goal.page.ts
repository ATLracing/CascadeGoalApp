import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, Goal, Task, DatabaseHelper, Vision } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

export class NewGoalPageSettings
{
  preset_vision: boolean;
}

@Component({
  selector: 'new-goal-page',
  templateUrl: 'new_goal.page.html',
  styleUrls: ['new_goal.page.scss']
})
export class NewGoalPage implements OnDestroy {
  private new_goal_: Goal;
  private all_visions_: Vision[];
  private vision_parent_id_string_;
  private input_settings_: NewGoalPageSettings;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.input_settings_ = this.addressed_transfer_.get_for_route(router_, "settings");
    if (this.input_settings_ == undefined)
      this.input_settings_ = new NewGoalPageSettings();

    database_manager_.register_data_updated_callback("new_goal_page", () => {
      this.all_visions_ = database_manager_.get_image_delegate().get_visions(); // TODO: Needed for updates?
    });

    this.new_goal_ = DatabaseHelper.create_blank_goal();
    console.log("New Task constructed");
  }

  save()
  {
    // TODO(ABurroughs): This sucks
    this.new_goal_.parent_id = parseInt(this.vision_parent_id_string_);
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_goal_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_goal_page");
  }
}
