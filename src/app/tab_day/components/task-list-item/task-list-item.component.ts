import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { TaskListDropdownArguments, TaskListItemPopoverComponent } from '../task-list-item-popover/task-list-item-popover.component';

export enum ContextDependentTaskAttributesTab
{
  MANAGE,
  WEEK,
  DAY
}

export class ContextDependentTaskAttributes
{
  assigned_lhs : boolean;
  assigned_active_lhs : boolean;
  tab : ContextDependentTaskAttributesTab;
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

  add_remove_disabled_ : boolean;
  complete_ : boolean;
  attributes_: ContextDependentTaskAttributes;

  text_style_ : {[key:string] : string};

  constructor(private addressed_transfer_ : AddressedTransfer,
              private database_manager_   : DatabaseManager,
              private calendar_manager_   : CalendarManager,
              private router_             : Router,
              private route_              : ActivatedRoute,
              private popover_controller_ : PopoverController) {}

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

  async open_dropdown(ev: any) {
    let dropdown_args : TaskListDropdownArguments = { task_attributes : this.attributes_,
                                                      add_remove_disabled : this.add_remove_disabled_,
                                                      task: this.task };
    this.addressed_transfer_.put("task-list-item-dropdown-assigned", dropdown_args);
    
    const popover = await this.popover_controller_.create({
      component: TaskListItemPopoverComponent,
      event: ev,
      translucent: true,
    });
    await popover.present();

    const { role } = await popover.onWillDismiss();

    if (role == "edit")
    {
      this.edit();
    }
    else if (role == "add_remove_lhs")
    {
      this.sched_add_remove_lhs(this.task);
    }
    else if (role == "remove")
    {
      this.sched_remove_current(this.task);
    }

    console.log('onDidDismiss resolved with role', role);
  }

  ngOnInit() {}

  ngOnChanges()
  {
    let complete = InflatedRecord.is_complete(this.task);
    let dormant = InflatedRecord.is_dormant(this.task);
    let overdue = InflatedRecord.is_overdue(this.task);
    
    this.add_remove_disabled_ = complete || dormant;
    this.complete_ = complete;
    this.attributes_ = this.get_context_dependent_attributes(this.task);

    // Configure text style
    this.text_style_ = {};

    if (complete)
      this.text_style_['text-decoration'] = "line-through";
    
    if (this.attributes_.assigned_active_lhs && !dormant)
      this.text_style_['font-weight'] = "bold";

    if (overdue)
    {
      // TODO(ABurroughs): Use Ionic color preset
      this.text_style_['color'] = 'orange';
    }
  }
}
