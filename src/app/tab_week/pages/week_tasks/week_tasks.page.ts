import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, WeekFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
})
export class WeekTasksPage implements OnDestroy {
  private tasks_: InflatedRecord.Task[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    
    this.tasks_ = [];

    database_manager_.register_data_updated_callback("this_week_tasks_page", async () => {            
      // Get the current week
      let week_number = CalendarManager.get_iso_week();
      
      // Query all tasks for the week
      let week_filter = new WeekFilter(week_number);
      this.tasks_ = await database_manager_.query_tasks([week_filter]);
            
      // Append UI info
      for (let task of this.tasks_)
      {
        task.extra = {};

        // Style
        const STYLE_COMPLETE = 'line-through';
        const STYLE_DAY = 'bold';

        task.extra.style_complete = !InflatedRecord.is_active(task) ? STYLE_COMPLETE : undefined
        task.extra.today = CalendarManager.get_day_of_week() == task.day;
        task.extra.style_today = task.extra.today ? STYLE_DAY : undefined;
      }
    });
  }

  add_new_task()
  {
    let new_task = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);
    new_task.week = CalendarManager.get_iso_week();

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

  edit_task(index: number)
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.tasks_[index],
        
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

  add_remove_today(index: number)
  {
    let task = this.tasks_[index];

    if (CalendarManager.in_today(task))
    {
      task.day = InflatedRecord.NULL_DAY;
    }
    else
    {
      task.day = CalendarManager.get_day_of_week();
    }

    this.database_manager_.task_set_basic_attributes(task);
  }

  remove(index: number)
  {
    let remove_task = this.tasks_[index];

    remove_task.day = InflatedRecord.NULL_DAY;
    remove_task.week = InflatedRecord.NULL_WEEK;

    this.database_manager_.task_set_basic_attributes(remove_task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
