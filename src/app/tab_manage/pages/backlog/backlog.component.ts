import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { DatabaseManager, ActiveFilter, DateCompletedContainsFilter, QueryFilter, join_and, NotFilter, ScheduledFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { SettingsComponent, ManageSettings } from '../../components/settings/settings';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { get_this_week } from 'src/app/providers/discrete_date';

@Component({
  selector: 'backlog-page',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogPage implements OnInit, OnDestroy {
  private active_unscheduled_tasks_: InflatedRecord.Task[];
  private active_scheduled_tasks_: InflatedRecord.Task[];
  private complete_tasks_: InflatedRecord.Task[];

  private settings_: ManageSettings;

  @Input() send_to_week_mode: boolean;

  constructor(private database_manager_: DatabaseManager) { 
    this.active_unscheduled_tasks_ = [];
    this.active_scheduled_tasks_ = [];
    this.complete_tasks_ = [];
    
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
    let active_unscheduled_tasks = await this.database_manager_.query_tasks(join_and(new ActiveFilter(true), new NotFilter(new ScheduledFilter())));
    let active_scheduled_tasks = await this.database_manager_.query_tasks(join_and(new ActiveFilter(true), new ScheduledFilter()));
    let completed_filter : QueryFilter = new ActiveFilter(false);

    if (!this.settings_.show_completed)
      completed_filter = join_and(completed_filter, new DateCompletedContainsFilter(get_this_week()));
      
    let complete_tasks = await this.database_manager_.query_tasks(completed_filter);
    
    let all_tasks = active_unscheduled_tasks.concat(active_scheduled_tasks.concat(complete_tasks));

    // TODO: Inflate
    await DatabaseInflator.upward_inflate(all_tasks, database_manager);

    this.active_unscheduled_tasks_ = active_unscheduled_tasks;
    this.active_scheduled_tasks_ = active_scheduled_tasks;
    this.complete_tasks_ = complete_tasks;
  }

  ngOnInit() {}

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("backlog_page");
  }
}
