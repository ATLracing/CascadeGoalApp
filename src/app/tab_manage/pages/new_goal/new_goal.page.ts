import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, Goal, Task, DatabaseHelper, Vision } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'new-goal-page',
  templateUrl: 'new_goal.page.html',
  styleUrls: ['new_goal.page.scss']
})
export class NewGoalPage implements OnDestroy {
  private all_visions_: Vision[];
  private new_goal_: Goal;
  private vision_parent_id_string_;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    database_manager_.register_data_updated_callback("new_goal_page", () => {
      this.all_visions_ = database_manager_.get_visions_copy(); // TODO: Needed for updates?
    });

    this.new_goal_ = DatabaseHelper.create_blank_goal();
    console.log("New Task constructed");
  }

  save()
  {
    // TODO(ABurroughs): This sucks
    this.new_goal_.parent_id = parseInt(this.vision_parent_id_string_);
    this.addressed_transfer_.get(this.router_.url + "_callback")(this.new_goal_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_goal_page");
  }
}
