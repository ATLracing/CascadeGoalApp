import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { get_this_week, contains, get_today, prior_to } from 'src/app/providers/discrete_date';

@Component({
  selector: 'task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss'],
})
export class TaskListItemComponent implements OnInit, OnChanges{
  @Input() task: InflatedRecord.Task;
  @Input() add_mode: boolean;
  @Input() show_parent: boolean;
  add_mode_disabled_ : boolean;
  text_style_ : {[key:string] : string};
  icon_color_ : string;
  is_this_week_: boolean;

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private router_            : Router,
              private route_             : ActivatedRoute) {}

  add_remove_this_week()
  {
    if (contains(this.task.discrete_date, get_this_week()))
    {
      InflatedRecord.clear_week(this.task);
    }
    else
    {
      InflatedRecord.set_this_week(this.task);
    }

    this.database_manager_.tgv_set_basic_attributes(this.task);
  }

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

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.tgv_set_basic_attributes(edited_task); 
        },
        delete_callback: (edited_goal: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_goal); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnInit() {}

  ngOnChanges()
  {
    // Determine attributes
    let today = get_today();
    let this_week = get_this_week();

    let is_active = InflatedRecord.is_active(this.task);
    let due_this_week = contains(this.task.discrete_date, this_week);
    let overdue = prior_to(this.task.discrete_date, today) && is_active;
    let completed_this_week = contains(this.task.discrete_date_completed, this_week);

    // Set UI parameters
    this.is_this_week_ = due_this_week || overdue || completed_this_week;
    this.add_mode_disabled_ = !is_active;

    // Configure text style
    this.text_style_ = {};

    if (!is_active)
      this.text_style_['text-decoration'] = "line-through"; 
    
    if (this.is_this_week_)
      this.text_style_['font-weight'] = "bold";
    
    // Configure icon style
    this.icon_color_ = "black";

    if (overdue)
    {
      this.icon_color_ = 'warning';
    }
  }
}
