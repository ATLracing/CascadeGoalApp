import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, DateContainsFilter, DatePriorFilter, ActiveFilter, DateLevelFilter, DateCompletedContainsFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ConfigureTgvPageSettings } from '../configure_tgv/configure_tgv.page';
import { get_today, DiscreteDateLevel } from 'src/app/providers/discrete_date';

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
      
        this.overdue_tasks_ = await database_manager_.query_tasks([new DatePriorFilter(today), new DateLevelFilter(DiscreteDateLevel.DAY), new ActiveFilter(true)]);
        this.active_tasks_ = await database_manager_.query_tasks([new DateContainsFilter(today), new ActiveFilter(true)]);
        this.complete_tasks_ = await database_manager_.query_tasks([new DateCompletedContainsFilter(today)]);

        // Get parent
        for (let task of this.active_tasks_)
        {
          if (task.parent_id)
          {
            task.parent = await database_manager_.get_node(task.parent_id);
          }
        }

        // Append extra info
        for (let task of this.active_tasks_)
        {
            task.extra.completed = !InflatedRecord.is_active(task);
            task.extra.expanded = false;

            if (task.extra.carried)
            {
                task.extra.style = {'color': 'orange'}
            }
            else
            {
                task.extra.style = {};
            }
        }
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
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("today_tasks_page");
  }
}
