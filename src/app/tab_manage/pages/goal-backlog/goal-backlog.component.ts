import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { DatabaseManager, ActiveFilter, DateCompletedContainsFilter, QueryFilter, join_and } from 'src/app/providers/database_manager';
import { ManageSettings } from '../../components/settings/settings';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { get_this_week } from 'src/app/providers/discrete_date';

@Component({
  selector: 'goal-backlog-page',
  templateUrl: './goal-backlog.component.html',
  styleUrls: ['./goal-backlog.component.scss'],
})
export class GoalBacklogPage implements OnInit, OnDestroy {
  private active_goals_: InflatedRecord.Goal[];
  private completed_goals_: InflatedRecord.Goal[];

  private settings_: ManageSettings;

  @Input() send_to_week_mode: boolean;

  @Input()
  set settings(settings: ManageSettings)
  {
    this.settings_ = settings;
    this.get_expanded_goals();
  }

  constructor(private database_manager_: DatabaseManager) { 
    this.active_goals_ = [];
    this.completed_goals_ = [];
  }

  async get_expanded_goals()
  {
    let completed_filter : QueryFilter = new ActiveFilter(false);

    if (!this.settings_.show_completed)
      completed_filter = join_and(completed_filter, new DateCompletedContainsFilter(get_this_week()));

    let active_goals = await this.database_manager_.query_goals(new ActiveFilter(true));
    let completed_goals = await this.database_manager_.query_goals(completed_filter);
  
    let all_goals = active_goals.concat(completed_goals);
    // Inflate the active goals
    for (let goal of all_goals)
    {
      await DatabaseInflator.inflate_goal(goal, this.database_manager_, false);
    }

    this.active_goals_ = active_goals;
    this.completed_goals_ = completed_goals;
  }

  ngOnInit() {
    this.database_manager_.register_data_updated_callback("goal_backlog_page", async () => {
      this.get_expanded_goals();
    });
  }
  
  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("goal_backlog_page");
  }
}
