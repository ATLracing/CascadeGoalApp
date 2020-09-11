import { Component, Input, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { ActiveFilter, DatabaseManager, join_and, ScheduledFilter } from 'src/app/providers/database_manager';
import { contains, DiscreteDate, get_this_week, prior_to, week_offset_str } from 'src/app/providers/discrete_date';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { ContextDependentTaskAttributes } from 'src/app/tab_day/components/task-list-item/task-list-item.component';
import { ManageSettings } from '../../components/settings/settings';
import { get_manage_attributes } from '../common/context_dependent_attributes';

class CalendarWeekTasks
{
  date: DiscreteDate;
  offset_str: string;
  tasks: InflatedRecord.Task[];
};

@Component({
  selector: 'calendar-page',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarPage implements OnInit {
  private active_scheduled_week_tasks_: CalendarWeekTasks[];
  private settings_: ManageSettings;

    constructor(private database_manager_: DatabaseManager,
                private calendar_manager_: CalendarManager,
                private loading_controller_: LoadingController) { 
    this.active_scheduled_week_tasks_ = [];
    
    database_manager_.register_data_updated_callback("calendar_page", async () => {
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

    let active_scheduled_tasks = await this.database_manager_.query_tasks(join_and(new ActiveFilter(), new ScheduledFilter()));          
    
    // TODO: Inflate
    await DatabaseInflator.upward_inflate(active_scheduled_tasks, database_manager);

    // Organize tasks according to week
    let this_week = get_this_week();
    let calendar_week_tasks_map = new Map<string, CalendarWeekTasks>();

    for (let task of active_scheduled_tasks)
    {
      let date_string = JSON.stringify({ week: task.discrete_date.week, year: task.discrete_date.year });
      if (!calendar_week_tasks_map.has(date_string))
      {
        calendar_week_tasks_map.set(date_string, { date: task.discrete_date , offset_str: week_offset_str(task.discrete_date, this_week), tasks: [task] });
      }
      else
      {
        calendar_week_tasks_map.get(date_string).tasks.push(task);
      }
    }

    this.active_scheduled_week_tasks_ = Array.from(calendar_week_tasks_map.values());
    this.active_scheduled_week_tasks_.sort((a, b) => prior_to(a.date, b.date) ? -1 : 0); 
    // TODO: Zero out the day component to be safe?

    await loading.dismiss();
  }

    // Task list child
  get_attributes(node: InflatedRecord.TgvNode) : ContextDependentTaskAttributes
  {
      return get_manage_attributes(node, this.calendar_manager_);
  }

  ngOnInit() {}
}
