import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { get_today, prior_to } from 'src/app/providers/discrete_date';
import { CalendarManager } from 'src/app/providers/calendar_manager';

export class ContextDependentTaskAttributes
{
  assigned_lhs : boolean;
  assigned_active_lhs: boolean;
};

@Component({
  selector: 'task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss'],
})
export class TaskListItemComponent implements OnInit, OnChanges{
  @Input() task: InflatedRecord.Task;
  
  @Input() sched_add_remove_lhs: (node: InflatedRecord.TgvNode) => void;
  @Input() sched_remove_current: (node: InflatedRecord.TgvNode) => void;
  @Input() get_context_dependent_attributes: (node: InflatedRecord.TgvNode) => ContextDependentTaskAttributes;

  @Input() add_mode: boolean;
  @Input() show_parent: boolean;
  @Input() slide_to_remove: boolean;

  add_mode_disabled_ : boolean;
  complete_ : boolean;
  assigned_lhs_: boolean;

  text_style_ : {[key:string] : string};

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private calendar_manager_  : CalendarManager,
              private router_            : Router,
              private route_             : ActivatedRoute) {}

  edit()
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.task,
        
        // Display elements
        title: "Edit Task",
        enable_associate: true,
        enable_completion_status: true,
        enable_week_select: true,

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.tgv_set_basic_attributes(edited_task); 
        },
        delete_callback: (edited_goal: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_goal); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  checkbox_change()
  {
    if (InflatedRecord.is_active(this.task))
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.COMPLETE, this.task);
    }
    else
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.ACTIVE, this.task);
    }

    this.database_manager_.tgv_set_basic_attributes(this.task);
  }

  ngOnInit() {}

  ngOnChanges()
  {
    let attributes = this.get_context_dependent_attributes(this.task);
    let complete = InflatedRecord.is_complete(this.task);
    let dormant = InflatedRecord.is_dormant(this.task);
    let overdue = InflatedRecord.is_overdue(this.task);
    
    this.add_mode_disabled_ = complete || dormant;
    this.complete_ = complete;
    this.assigned_lhs_ = attributes.assigned_lhs;

    // Configure text style
    this.text_style_ = {};

    if (complete)
      this.text_style_['text-decoration'] = "line-through";
    
    if (attributes.assigned_active_lhs && !dormant)
      this.text_style_['font-weight'] = "bold";

    if (overdue)
    {
      // TODO(ABurroughs): Use Ionic color preset
      this.text_style_['color'] = 'orange';
    }
  }
}
