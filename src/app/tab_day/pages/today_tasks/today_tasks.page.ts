import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, DateContainsFilter, DatePriorFilter, ActiveFilter, DateLevelFilter, DateCompletedContainsFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ConfigureTgvPageSettings } from '../configure_tgv/configure_tgv.page';
import { get_today, DiscreteDateLevel } from 'src/app/providers/discrete_date';
import { DatabaseInflator } from 'src/app/providers/database_inflator';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})

export class TaskListPage implements OnDestroy {
  private overdue_tasks_: InflatedRecord.Task[];
  private active_tasks_: InflatedRecord.Task[];
  private complete_tasks_: InflatedRecord.Task[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) 
  { 
    this.overdue_tasks_ = [];
    this.active_tasks_ = [];
    this.complete_tasks_ = [];

    database_manager_.register_data_updated_callback("today_tasks_page", async () => {              
        let today = get_today();
      
        let overdue_tasks = await database_manager_.query_tasks([new DatePriorFilter(today), new DateLevelFilter(DiscreteDateLevel.DAY), new ActiveFilter(true)]);
        let active_tasks = await database_manager_.query_tasks([new DateContainsFilter(today), new ActiveFilter(true)]);
        let complete_tasks = await database_manager_.query_tasks([new DateCompletedContainsFilter(today)]);

        let all_tasks = overdue_tasks.concat(active_tasks).concat(complete_tasks);

        await DatabaseInflator.upward_inflate(all_tasks, database_manager_);

        this.overdue_tasks_ = overdue_tasks;
        this.active_tasks_ = active_tasks;
        this.complete_tasks_ = complete_tasks;
    });
  }

  add_new_task()
  {
    let new_task = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);
    InflatedRecord.set_today(new_task);

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
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("today_tasks_page");
  }
}
