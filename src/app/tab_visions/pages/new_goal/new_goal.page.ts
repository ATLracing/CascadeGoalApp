import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator } from 'src/app/providers/database_inflator';

export class NewGoalPageSettings
{
  parent_id: InflatedRecord.ID;
}

@Component({
  selector: 'new-goal-page',
  templateUrl: 'new_goal.page.html',
  styleUrls: ['new_goal.page.scss']
})
export class NewGoalPage implements OnDestroy {
  private new_goal_: InflatedRecord.Goal;
  private all_visions_: InflatedRecord.Vision[];
  private input_settings_: NewGoalPageSettings;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.new_goal_ = InflatedRecord.construct_empty_node(InflatedRecord.Type.GOAL);

    if (this.input_settings_ == undefined)
      this.input_settings_ = new NewGoalPageSettings();

    this.input_settings_ = this.addressed_transfer_.get_for_route(router_, "settings");
    this.new_goal_.parent_id = this.input_settings_.parent_id;

    database_manager_.register_data_updated_callback("new_goal_page", async () => {
      this.all_visions_ = await database_manager_.query_visions();
    });

    console.log("New Task constructed");
  }

  save()
  {    
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_goal_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_goal_page");
  }
}
