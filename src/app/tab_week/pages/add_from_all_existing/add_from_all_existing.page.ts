import { Component } from '@angular/core';
import { DatabaseManager, ExpandedGoal, DatabaseHelper, TaskFilter } from '../../../providers/database_manager';
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
export class AddFromAllExistingPage {
  private goals_: ExpandedGoal[];
  private expanded_goals_array_: boolean[];

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute) {
    this.expanded_goals_array_ = [];
    
    let inputs = this.addressed_transfer_.get_for_route(router_, "inputs");
    let excluded_ids = inputs.excluded_ids;

    database_manager_.register_data_updated_callback("add_from_all_existing_page", () => {
      this.goals_ = DatabaseHelper.query_goals(this.database_manager_, TaskFilter.excluding(excluded_ids));

      let new_expanded_goals_array = [];

      for (let goal of this.goals_)
      {
        new_expanded_goals_array.push(false);
      }

      this.expanded_goals_array_ = new_expanded_goals_array;
    });
  }

  goal_show_hide_tasks(goal_index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_goals_array_[goal_index] = !this.expanded_goals_array_[goal_index];
  }
}
