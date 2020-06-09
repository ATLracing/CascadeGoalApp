import { Component, OnDestroy, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatabaseManager, WeekFilter, ActiveFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
  styleUrls: ['week_tasks.scss']
})
export class WeekTasksPage implements OnDestroy {
  private active_tasks_: InflatedRecord.Task[];
  private complete_tasks_: InflatedRecord.Task[];
  private editing_unlocked_: boolean;
  private display_analytics_: boolean;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {

    this.active_tasks_ = [];
    this.complete_tasks_ = [];
    this.editing_unlocked_ = false;

    database_manager_.register_data_updated_callback("this_week_tasks_page", async () => {            
      // Get the current week
      let week_number = CalendarManager.get_iso_week();
      let year_number = CalendarManager.get_iso_week_year();
      
      // Query all tasks for the week
      let week_filter = new WeekFilter(week_number, year_number);
      this.active_tasks_ = await database_manager_.query_tasks([week_filter, new ActiveFilter(true)]);
      this.complete_tasks_ = await database_manager_.query_tasks([week_filter, new ActiveFilter(false)]);
    });
  }

  lock_unlock_editing()
  {
    this.editing_unlocked_ = ! this.editing_unlocked_;
  }

  toggle_analytics()
  {
    this.display_analytics_ = !this.display_analytics_;
  }

  add_new_task()
  {
    let new_task = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);
    InflatedRecord.set_this_week(new_task);

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_task,
        
        // Display elements
        title: "New Task",
        enable_associate: true,
        enable_completion_status: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.task_add(new_task); },
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  edit_task(index: number, is_active: boolean)
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: is_active ? this.active_tasks_[index] : this.complete_tasks_[index],
        
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

  add_remove_today(index: number, is_active: boolean)
  {
    let task = is_active ? this.active_tasks_[index] : this.complete_tasks_[index];

    if (CalendarManager.in_today(task))
    {
      InflatedRecord.clear_day(task);
    }
    else
    {
      InflatedRecord.set_today(task);
    }

    this.database_manager_.task_set_basic_attributes(task);
  }

  remove(index: number, is_active: boolean)
  {
    let remove_task = is_active ? this.active_tasks_[index] : this.complete_tasks_[index];
    InflatedRecord.clear_week(remove_task);

    this.database_manager_.task_set_basic_attributes(remove_task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
