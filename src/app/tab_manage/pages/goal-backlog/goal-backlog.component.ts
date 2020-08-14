import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { DatabaseManager, ActiveFilter, QueryFilter, join_and, DormantFilter, CompleteGoalFilter } from 'src/app/providers/database_manager';
import { ManageSettings } from '../../components/settings/settings';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { LoadingController } from '@ionic/angular';
import { CalendarManager } from 'src/app/providers/calendar_manager';

@Component({
  selector: 'goal-backlog-page',
  templateUrl: './goal-backlog.component.html',
  styleUrls: ['./goal-backlog.component.scss'],
})
export class GoalBacklogPage implements OnInit, OnDestroy {
  private active_goals_: InflatedRecord.Goal[];
  private completed_goals_: InflatedRecord.Goal[];
  private dormant_goals_ : InflatedRecord.Goal[];

  private settings_: ManageSettings;

  @Input() send_to_week_mode: boolean;

  @Input()
  set settings(settings: ManageSettings)
  {
    this.settings_ = settings;
    this.get_expanded_goals();
  }

  constructor(private database_manager_: DatabaseManager,
              private calendar_manager_: CalendarManager,
              private loading_controller_: LoadingController) {
    this.active_goals_ = [];
    this.completed_goals_ = [];
    this.dormant_goals_ = [];
  }

  async get_expanded_goals()
  {
    // Loading controller
    const loading = await this.loading_controller_.create({
      cssClass: 'page-loading-spinner',
      message: '',
      duration: 0 // infinite
    });

    await loading.present();

    let active_goals = await this.database_manager_.query_goals(new ActiveFilter());
    let completed_goals = await this.database_manager_.query_goals(new CompleteGoalFilter(this.settings_.show_completed ? undefined : this.calendar_manager_.get_active_week()));
    let dormant_goals = await this.database_manager_.query_goals(new DormantFilter());

    let all_goals = active_goals.concat(completed_goals.concat(dormant_goals));
    // Inflate the active goals
    for (let goal of all_goals)
    {
      await DatabaseInflator.inflate_goal(goal, this.database_manager_, false);
    }

    this.active_goals_ = active_goals;
    this.completed_goals_ = completed_goals;
    this.dormant_goals_ = dormant_goals;

    await loading.dismiss();
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
