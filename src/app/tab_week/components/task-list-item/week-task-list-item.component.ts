import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { get_level, DiscreteDateLevel, get_today, contains, prior_to, get_this_week } from 'src/app/providers/discrete_date';

@Component({
  selector: 'week-task-list-item',
  templateUrl: './week-task-list-item.component.html',
  styleUrls: ['./week-task-list-item.component.scss'],
})
export class WeekTaskListItemComponent implements OnInit, OnChanges {
  @Input() task: InflatedRecord.Task;
  @Input() add_mode: boolean;
  add_mode_disabled_ : boolean;
  text_style_ : {[key:string] : string};
  icon_color_ : string;
  is_today_: boolean;

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private router_            : Router,
              private route_             : ActivatedRoute) {
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
        enable_week_select: true,

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.tgv_set_basic_attributes(edited_task); 
        },
        delete_callback: (edited_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_task); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  add_remove_today()
  {
    if (get_level(this.task.discrete_date) == DiscreteDateLevel.DAY)
    {
      InflatedRecord.clear_day(this.task);
    }
    else
    {
      InflatedRecord.set_today(this.task);
    }

    this.database_manager_.tgv_set_basic_attributes(this.task);
  }

  remove()
  {
    InflatedRecord.clear_week(this.task);
    this.database_manager_.tgv_set_basic_attributes(this.task);
  }

  ngOnInit() 
  {
    
  }

  ngOnChanges()
  {
    // Determine attributes
    let today = get_today();

    let is_active = InflatedRecord.is_active(this.task);
    let due_today = contains(this.task.discrete_date, today);
    let overdue_day = is_active && get_level(this.task.discrete_date) == DiscreteDateLevel.DAY && prior_to(this.task.discrete_date, today);
    let completed_today = contains(this.task.discrete_date_completed, today);
    
    // Set UI parameters
    this.is_today_ = due_today || overdue_day || completed_today;
    this.add_mode_disabled_ = !is_active;

    // Configure text style
    this.text_style_ = {};

    if (!is_active)
      this.text_style_['text-decoration'] = "line-through"; 
    
    if (this.is_today_)
      this.text_style_['font-weight'] = "bold";
    
    // Configure icon style
    this.icon_color_ = "black";
    if (overdue_day)
    {
      this.icon_color_ = 'warning';
    }
  }
}
