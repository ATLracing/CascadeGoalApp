import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DatabaseManager, ActiveFilter, QueryFilter, join_and, NotFilter, ScheduledFilter, DormantFilter, CompleteFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { SettingsComponent, ManageSettings } from '../../components/settings/settings';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { LoadingController } from '@ionic/angular';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DiscreteDate, prior_to, DiscreteDateLevel, get_level, get_today, contains } from 'src/app/providers/discrete_date';
import { ContextDependentTaskAttributes } from 'src/app/tab_day/components/task-list-item/task-list-item.component';
import { get_manage_attributes, manage_add_remove_week } from '../common/context_dependent_attributes';

class CalendarWeekTasks
{
  date: DiscreteDate;
  tasks: InflatedRecord.Task[];
};

@Component({
  selector: 'backlog-page',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogPage implements OnInit, OnDestroy {
  private active_unscheduled_tasks_: InflatedRecord.Task[];
  private active_scheduled_week_tasks_: CalendarWeekTasks[];
  private complete_tasks_: InflatedRecord.Task[];
  private dormant_tasks_: InflatedRecord.Task[];

  private settings_: ManageSettings;

  @Input() send_to_week_mode: boolean;

  constructor(private database_manager_: DatabaseManager,
              private calendar_manager_: CalendarManager,
              private loading_controller_: LoadingController) { 
    this.active_unscheduled_tasks_ = [];
    this.active_scheduled_week_tasks_ = [];
    this.complete_tasks_ = [];
    this.dormant_tasks_ = [];
    
    database_manager_.register_data_updated_callback("backlog_page", async () => {
      this.get_expanded_tasks(this.settings_, database_manager_);
    });
  }

  @Input() set settings(settings: ManageSettings)
  {
    this.settings_ = settings;

    this.get_expanded_tasks(this.settings_, this.database_manager_);
  }

  async get_expanded_tasks(settings: ManageSettings, database_manager: DatabaseManager)
  {
    // Loading controller
    const loading = await this.loading_controller_.create({
      cssClass: 'page-loading-spinner',
      message: '',
      duration: 0 // infinite
    });

    await loading.present();

    let active_unscheduled_tasks = await this.database_manager_.query_tasks(join_and(new ActiveFilter(), new NotFilter(new ScheduledFilter())));
    let active_scheduled_tasks = await this.database_manager_.query_tasks(join_and(new ActiveFilter(), new ScheduledFilter()));      
    let complete_tasks = await this.database_manager_.query_tasks(new CompleteFilter(this.settings_.show_completed ? undefined : this.calendar_manager_.get_active_week()));
    let dormant_tasks = await this.database_manager_.query_tasks(new DormantFilter());
    
    let all_tasks = active_unscheduled_tasks.concat(active_scheduled_tasks.concat(complete_tasks.concat(dormant_tasks)));

    // TODO: Inflate
    await DatabaseInflator.upward_inflate(all_tasks, database_manager);

    // Organize tasks according to week
    let calendar_week_tasks_map = new Map<string, CalendarWeekTasks>();

    for (let task of active_scheduled_tasks)
    {
      let date_string = JSON.stringify({ week: task.discrete_date.week, year: task.discrete_date.year });
      if (!calendar_week_tasks_map.has(date_string))
      {
        calendar_week_tasks_map.set(date_string, { date: task.discrete_date , tasks: [task] });
      }
      else
      {
        calendar_week_tasks_map.get(date_string).tasks.push(task);
      }
    }

    this.active_unscheduled_tasks_ = active_unscheduled_tasks;
    this.active_scheduled_week_tasks_ = Array.from(calendar_week_tasks_map.values());
    this.active_scheduled_week_tasks_.sort((a, b) => prior_to(a.date, b.date) ? -1 : 0)
    this.complete_tasks_ = complete_tasks;
    this.dormant_tasks_ = dormant_tasks;

    await loading.dismiss();
  }

  // Task list child
  get_attributes(node: InflatedRecord.TgvNode) : ContextDependentTaskAttributes
  {
      return get_manage_attributes(node, this.calendar_manager_);
  }

  add_remove_week(node: InflatedRecord.TgvNode)
  {
    manage_add_remove_week(node, this.database_manager_, this.calendar_manager_);
  }

  ngOnInit() {}

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("backlog_page");
  }
}
