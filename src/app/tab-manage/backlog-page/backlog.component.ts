import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DatabaseManager, ActiveFilter, QueryFilter, join_and, NotFilter, ScheduledFilter, DormantFilter, CompleteFilter } from 'src/app/core/providers/database-manager';
import * as InflatedRecord from 'src/app/core/providers/inflated-record'
import { SettingsComponent, ManageSettings } from '../settings/settings';
import { DatabaseInflator } from 'src/app/core/providers/database-inflator';
import { LoadingController } from '@ionic/angular';
import { CalendarManager } from 'src/app/core/providers/calendar-manager';
import { DiscreteDate, prior_to, DiscreteDateLevel, get_level, get_today, contains } from 'src/app/core/providers/discrete-date';
import { ContextDependentTaskAttributes } from 'src/app/core/components/task-list-item/task-list-item.component';
import { get_manage_attributes, manage_add_remove_week } from '../common/context_dependent_attributes';

@Component({
  selector: 'backlog-page',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogPage implements OnInit, OnDestroy {
  private active_unscheduled_tasks_: InflatedRecord.Task[];
  private active_scheduled_week_tasks_: InflatedRecord.Task[];
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
    
    this.settings_ = new ManageSettings();
    
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
    let dormant_tasks = this.settings_.show_dormant ? await this.database_manager_.query_tasks(new DormantFilter()) : [];
    
    let all_tasks = active_unscheduled_tasks.concat(active_scheduled_tasks.concat(complete_tasks.concat(dormant_tasks)));

    // TODO: Inflate
    await DatabaseInflator.upward_inflate(all_tasks, database_manager);

    // Sort scheduled tasks by date
    active_scheduled_tasks.sort((a, b) => prior_to(a.discrete_date, b.discrete_date) ? -1 : 0);

    this.active_unscheduled_tasks_ = active_unscheduled_tasks;
    this.active_scheduled_week_tasks_ = active_scheduled_tasks;
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
