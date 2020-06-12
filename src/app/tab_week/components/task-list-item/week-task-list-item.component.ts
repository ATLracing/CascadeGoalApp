import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';
import { get_level, DiscreteDateLevel, get_today, contains } from 'src/app/providers/discrete_date';

const STYLE_COMPLETE = 'line-through';
const STYLE_TODAY = 'bold';

@Component({
  selector: 'week-task-list-item',
  templateUrl: './week-task-list-item.component.html',
  styleUrls: ['./week-task-list-item.component.scss'],
})
export class WeekTaskListItemComponent implements OnInit, OnChanges {
  @Input() task: InflatedRecord.Task;
  @Input() add_mode: boolean;
  add_mode_disabled_ : boolean;

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

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.task_set_basic_attributes(edited_task, true); 
          this.database_manager_.task_set_parent(edited_task.id, edited_task.parent_id)
        },
        delete_callback: (edited_task: InflatedRecord.TgvNode) => { this.database_manager_.task_remove(edited_task.id); }
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

    this.database_manager_.task_set_basic_attributes(this.task);
  }

  remove()
  {
    InflatedRecord.clear_week(this.task);
    this.database_manager_.task_set_basic_attributes(this.task);
  }

  ngOnInit() 
  {
    
  }

  ngOnChanges()
  {
    this.task.extra.style_complete = !InflatedRecord.is_active(this.task) ? STYLE_COMPLETE : undefined;
    
    if (InflatedRecord.is_active(this.task))
      this.task.extra.today = contains(this.task.discrete_date, get_today());
    else
      this.task.extra.today = contains(this.task.discrete_date_completed, get_today());
    
    this.task.extra.style_today = this.task.extra.today ? STYLE_TODAY : undefined;
    this.database_manager_.get_node(this.task.parent_id).then(parent => { this.task.parent = parent; });
    this.add_mode_disabled_ = !InflatedRecord.is_active(this.task);
  }
}
