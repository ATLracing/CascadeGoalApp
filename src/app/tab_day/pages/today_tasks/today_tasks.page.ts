import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager, DayFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ConfigureTgvPageSettings } from '../configure_tgv/configure_tgv.page';
import { resolve } from 'url';

@Component({
  selector: 'app-tab1',
  templateUrl: 'today_tasks.page.html',
  styleUrls: ['today_tasks.page.scss']
})

export class TaskListPage implements OnDestroy {
  private day_tasks_: InflatedRecord.Task[];

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) 
  {    
    database_manager_.register_data_updated_callback("today_tasks_page", async () => {      
        let day_number = CalendarManager.get_day_of_week();
        let week_number = CalendarManager.get_iso_week();
        let year_number = CalendarManager.get_iso_week_year();
        
        let day_filter = new DayFilter(day_number, week_number, year_number);
        this.day_tasks_ = await database_manager_.query_tasks([day_filter]);

        // Get parent
        for (let task of this.day_tasks_)
        {
          if (task.parent_id)
          {
            task.parent = await database_manager_.get_node(task.parent_id);
          }
        }

        // Append extra info
        for (let task of this.day_tasks_)
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

  edit_task(index: number)
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.day_tasks_[index],
        
        // Display elements
        title: "Edit Task",
        enable_associate: true,
        enable_completion_status: true,

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.task_set_basic_attributes(edited_task, true); 
          this.database_manager_.task_set_parent(edited_task.id, edited_task.parent_id)
        },
        delete_callback: (edited_task: InflatedRecord.TgvNode) => { this.database_manager_.task_remove(edited_task.id); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  expand_collapse_task(index: number)
  {
    this.day_tasks_[index].extra.expanded = !this.day_tasks_[index].extra.expanded;
  }

  checkbox_change(index: number)
  {
    let task = this.day_tasks_[index];

    if (InflatedRecord.is_active(task))
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.COMPLETE, task);
    }
    else
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.ACTIVE, task);
    }

    this.database_manager_.task_set_basic_attributes(task);  
  }

  remove(index: number)
  {
    console.log("Remove: " + index);
    let remove_task = this.day_tasks_[index];

    InflatedRecord.clear_day(remove_task);

    this.database_manager_.task_set_basic_attributes(remove_task);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("today_tasks_page");
  }
}
