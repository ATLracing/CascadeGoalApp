import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, ActiveFilter, DatePriorFilter, DateContainsFilter, DateLevelFilter, join_and, CompleteFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { DiscreteDateLevel, get_level, get_this_week, equals, get_today, contains } from 'src/app/providers/discrete_date';
import { DatabaseInflator } from 'src/app/providers/database_inflator';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ContextDependentTaskAttributes, ContextDependentTaskAttributesLhs } from 'src/app/tab_day/components/task-list-item/task-list-item.component';

@Component({
  selector: 'app-week-tasks',
  templateUrl: 'week_tasks.page.html',
  styleUrls: ['week_tasks.scss'],
  animations: [
    trigger('openClose', [
      // ...
      state('open', style({
        height: '*',
        overflow: 'hidden'
      })),
      state('closed', style({
        height: '0px',
        overflow: 'hidden',
      })),
      transition('open => closed', [
        animate('200ms 0s ease-in-out')
      ]),
      transition('closed => open', [
        animate('200ms 0s ease-in-out')
      ]),
    ]),
  ]
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
  private current_week_active_: boolean;
  private page_title_: string;

  constructor(private database_manager_: DatabaseManager,
              private calendar_manager_: CalendarManager,
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
    
    this.page_title_ = "This Week";

    database_manager_.register_data_updated_callback("this_week_tasks_page", async () => {                  
      // Determine if past or future week
      this.current_week_active_ = equals(calendar_manager_.get_active_week(), get_this_week());

      // Set page title (TODO: Display offset; "Next Week" for +1)
      if (this.current_week_active_)
        this.page_title_ = "This Week";
      else
        this.page_title_ = `Week ${calendar_manager_.get_active_week().week}`;
      
      // Query all tasks for the week
      let overdue_tasks = [];
      if (this.current_week_active_)
        overdue_tasks = await database_manager_.query_tasks(join_and(new DatePriorFilter(this.calendar_manager_.get_active_week()), new DateLevelFilter(DiscreteDateLevel.WEEK), new ActiveFilter()));

      let active_tasks = await database_manager_.query_tasks(join_and(new DateContainsFilter(this.calendar_manager_.get_active_week()), new ActiveFilter()));
      let complete_tasks = await database_manager_.query_tasks(new CompleteFilter(this.calendar_manager_.get_active_week()));
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
    InflatedRecord.set_date(this.calendar_manager_.get_active_week(), new_task);

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_task,
        
        // Display elements
        title: "New Task",
        enable_associate: true,
        enable_completion_status: false,
        enable_week_select: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  // Task list item properties
  get_attributes(task: InflatedRecord.Task) : ContextDependentTaskAttributes
  {
    let assigned_to_day = get_level(task.discrete_date) == DiscreteDateLevel.DAY;
    
    let today = get_today();
    let completed_today = contains(task.discrete_date_completed, today);
    
    // Set UI parameters
    let assigned_lhs = assigned_to_day || completed_today;
    
    return {
      assigned_lhs : assigned_lhs,
      assigned_active_lhs: assigned_lhs,
      type_lhs: ContextDependentTaskAttributesLhs.DAY
    };
  }

  add_remove_today(task: InflatedRecord.TgvNode)
  {
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

  remove_from_week(task: InflatedRecord.TgvNode)
  {
    InflatedRecord.clear_week(task);
    this.database_manager_.tgv_set_basic_attributes(task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("this_week_tasks_page");
  }
}
