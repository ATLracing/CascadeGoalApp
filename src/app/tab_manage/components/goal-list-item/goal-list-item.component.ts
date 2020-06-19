import { Component, OnInit, Input } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { DatabaseManager } from 'src/app/providers/database_manager';

@Component({
  selector: 'goal-list-item',
  templateUrl: './goal-list-item.component.html',
  styleUrls: ['./goal-list-item.component.scss'],
})
export class GoalListItemComponent implements OnInit {
  @Input() goal: InflatedRecord.Goal;
  @Input() add_mode: boolean;
  expanded_: boolean;
  show_list_: boolean;

  // TODO..
  static goal_id_map;

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private router_            : Router,
              private route_             : ActivatedRoute) 
  {
    if (!GoalListItemComponent.goal_id_map)
      GoalListItemComponent.goal_id_map = new Map<InflatedRecord.ID, boolean>();
  }

  expand_collapse()
  {
    this.expanded_ = !this.expanded_;
    this.show_list_ = this.expanded_ && this.goal.children.length > 0;
    GoalListItemComponent.goal_id_map[this.goal.id] = this.expanded_;
  }

  add_task_to_goal()
  {
    // Create blank goal
    let new_goal = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);
    
    // Set goal's parent ID
    new_goal.parent_id = this.goal.id;

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_goal,
        
        // Display elements
        title: "New Task",
        enable_associate: false,
        enable_completion_status: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  edit()
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.goal,
        
        // Display elements
        title: "Edit Goal",
        enable_associate: true,
        enable_completion_status: true,

        // Callbacks
        save_callback: (edited_goal: InflatedRecord.TgvNode) => { 
          this.database_manager_.tgv_set_basic_attributes(edited_goal); 
        },
        delete_callback: (edited_goal: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_goal); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnInit() {
    // TODO: EWWWWWWwwww
    if (GoalListItemComponent.goal_id_map[this.goal.id])
    {
      this.expanded_ = GoalListItemComponent.goal_id_map[this.goal.id];
      this.show_list_ = this.expanded_ && this.goal.children.length > 0;
    }
  }

  ngOnChanges()
  {
    this.show_list_ = this.expanded_ && this.goal.children.length > 0;
  }
}
