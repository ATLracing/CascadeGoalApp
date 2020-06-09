import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { Router, ActivatedRoute } from '@angular/router';

const STYLE_COMPLETE = 'line-through';
const STYLE_ACTIVE = 'bold';

@Component({
  selector: 'task-list-item',
  templateUrl: './task-list-item.component.html',
  styleUrls: ['./task-list-item.component.scss'],
})
export class TaskListItemComponent implements OnInit, OnChanges{
  @Input() task: InflatedRecord.Task;
  @Input() add_mode: boolean;
  add_mode_disabled_ : boolean;

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private router_            : Router,
              private route_             : ActivatedRoute) {}

  add_remove_this_week()
  {
    if (CalendarManager.in_this_week(this.task))
    {
      this.task.week = InflatedRecord.NULL_WEEK;
    }
    else
    {
      this.task.week = CalendarManager.get_iso_week();
    }

    this.database_manager_.task_set_basic_attributes(this.task);
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
          this.database_manager_.task_set_parent(edited_task.id, edited_task.parent_id);
        },
        delete_callback: (edited_goal: InflatedRecord.TgvNode) => { this.database_manager_.task_remove(edited_goal.id); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnInit() {}

  ngOnChanges()
  {
    this.task.extra.this_week = CalendarManager.in_this_week(this.task);

    this.task.extra.style_complete = !InflatedRecord.is_active(this.task) ? STYLE_COMPLETE : undefined
    this.task.extra.active = CalendarManager.in_this_week(this.task);
    this.task.extra.style_active = this.task.extra.active ? STYLE_ACTIVE : undefined;
    this.add_mode_disabled_ = !InflatedRecord.is_active(this.task);
  }
}
