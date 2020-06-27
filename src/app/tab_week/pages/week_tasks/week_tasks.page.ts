import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, ActiveFilter, DatePriorFilter, DateContainsFilter, DateCompletedContainsFilter, DateLevelFilter, join_and } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { DiscreteDateLevel, get_level, get_this_week } from 'src/app/providers/discrete_date';
import { DatabaseInflator } from 'src/app/providers/database_inflator';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
  styleUrls: ['week_tasks.scss']
})
export class WeekTasksPage implements OnDestroy {
  private overdue_tasks_: InflatedRecord.Task[];
  private active_tasks_: InflatedRecord.Task[];
  private complete_tasks_: InflatedRecord.Task[];
  private all_tasks_: InflatedRecord.Task[];
  private editing_unlocked_: boolean;
  private editing_unlocked_color_: string;
  private display_analytics_: boolean;
  private toggle_analytics_color_: string;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {

    this.overdue_tasks_ = [];
    this.active_tasks_ = [];
    this.complete_tasks_ = [];
    this.all_tasks_ = [];

    this.editing_unlocked_color_ = "black";
    this.editing_unlocked_ = false;

    this.toggle_analytics_color_ = "black";
    this.display_analytics_ = false;

    database_manager_.register_data_updated_callback("this_week_tasks_page", async () => {                  
      // Query all tasks for the week
      let overdue_tasks = await database_manager_.query_tasks(join_and(new DatePriorFilter(get_this_week()), new DateLevelFilter(DiscreteDateLevel.WEEK), new ActiveFilter(true)));
      let active_tasks = await database_manager_.query_tasks(join_and(new DateContainsFilter(get_this_week()), new ActiveFilter(true)));
      let complete_tasks = await database_manager_.query_tasks(new DateCompletedContainsFilter(get_this_week()));
      let all_tasks = overdue_tasks.concat(active_tasks).concat(complete_tasks);

      // Inflate tasks
      await DatabaseInflator.upward_inflate(all_tasks, database_manager_);

      // Update list pointers
      this.overdue_tasks_ = overdue_tasks;
      this.active_tasks_ = active_tasks;
      this.complete_tasks_ = complete_tasks;
      this.all_tasks_ = all_tasks;
    });
  }

  lock_unlock_editing()
  {
    this.editing_unlocked_ = ! this.editing_unlocked_;
    this.editing_unlocked_color_ = this.editing_unlocked_color_ === "black" ? "primary" : "black";
  }

  toggle_analytics()
  {
    this.display_analytics_ = !this.display_analytics_;
    this.toggle_analytics_color_ = this.toggle_analytics_color_ === "black" ? "primary" : "black";
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
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
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
          this.database_manager_.tgv_set_basic_attributes(edited_task); 
        },
        delete_callback: (edited_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_task); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  add_remove_today(index: number, is_active: boolean)
  {
    let task = is_active ? this.active_tasks_[index] : this.complete_tasks_[index];

    if (get_level(task.discrete_date) == DiscreteDateLevel.DAY)
    {
      InflatedRecord.clear_day(task);
    }
    else
    {
      InflatedRecord.set_today(task);
    }

    this.database_manager_.tgv_set_basic_attributes(task);
  }

  remove(index: number, is_active: boolean)
  {
    let remove_task = is_active ? this.active_tasks_[index] : this.complete_tasks_[index];
    InflatedRecord.clear_week(remove_task);

    this.database_manager_.tgv_set_basic_attributes(remove_task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
