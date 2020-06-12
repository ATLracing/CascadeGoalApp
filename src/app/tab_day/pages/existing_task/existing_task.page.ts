// import { Component, OnDestroy } from '@angular/core';
// import { DatabaseManager, WeekFilter, IdSetFilter, ActiveFilter } from 'src/app/providers/database_manager';
// import * as InflatedRecord from 'src/app/providers/inflated_record';
// import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
// import { Router, ActivatedRoute } from '@angular/router';
// import { CalendarManager } from 'src/app/providers/calendar_manager';

// @Component({
//   selector: 'existing-task-page',
//   templateUrl: 'existing_task.page.html',
//   styleUrls: ['existing_task.page.scss']
// })
// export class ExistingTaskPage implements OnDestroy {
//   private available_tasks_: InflatedRecord.Task[];
//   private checkboxes_array_: boolean[];

//   constructor(private database_manager_: DatabaseManager,
//               private addressed_transfer_: AddressedTransfer,
//               private router_: Router,
//               private route_: ActivatedRoute)
//   {
//     let existing_day_task_ids = addressed_transfer_.get("existing_task_page_current_task_ids");

//     database_manager_.register_data_updated_callback("existing_task_page", async () => {
//       let week_number = CalendarManager.get_iso_week();
//       let year_number = CalendarManager.get_iso_week_year();
      
//       // Filters
//       let week_filter = new WeekFilter(week_number, year_number);
//       let exclude_filter = new IdSetFilter(existing_day_task_ids, false /*excluding*/);
//       let active_filter = new ActiveFilter(true);
      
//       let available_tasks_ = await database_manager_.query_tasks([week_filter, exclude_filter, active_filter]);
            
//       let new_checkboxes_array = [];
//       for (let i = 0; i < this.available_tasks_.length; ++i)
//       {
//         new_checkboxes_array.push(false);
//       }

//       this.checkboxes_array_ = new_checkboxes_array;
//     });
//   }

//   save()
//   {
//     let available_task_ids = [];

//     for (let i = 0; i < this.checkboxes_array_.length; ++i)
//     {
//       if (this.checkboxes_array_[i])
//       {
//         available_task_ids.push(this.available_tasks_[i].id)
//       }
//     }

//     this.addressed_transfer_.get("existing_task_page_callback")(available_task_ids);
//     this.router_.navigate(['../'], { relativeTo: this.route_} );
//   }

//   ngOnDestroy()
//   {
//     this.database_manager_.unregister_data_updated_callback("existing_task_page");
//   }
// }
