import { Component, OnInit, Input, OnChanges } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigureTgvPageSettings } from '../../pages/configure_tgv/configure_tgv.page';

@Component({
  selector: 'day-task-list-item',
  templateUrl: './day-task-list-item.component.html',
  styleUrls: ['./day-task-list-item.component.scss'],
})
export class DayTaskListItemComponent implements OnChanges, OnInit {
  @Input() task: InflatedRecord.Task;
  completed_ : boolean;
  expanded_: boolean;

  constructor(private addressed_transfer_: AddressedTransfer,
              private database_manager_  : DatabaseManager,
              private router_            : Router,
              private route_             : ActivatedRoute) {
    }

  expand_collapse()
  {
    this.expanded_ = !this.expanded_;
  }

  checkbox_change()
  {
    if (InflatedRecord.is_active(this.task))
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.COMPLETE, this.task);
    }
    else
    {
      InflatedRecord.resolve(InflatedRecord.Resolution.ACTIVE, this.task);
    }

    this.database_manager_.tgv_set_basic_attributes(this.task);  
  }

  remove()
  {
    InflatedRecord.clear_day(this.task);

    this.database_manager_.tgv_set_basic_attributes(this.task);
  }

  edit()
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.task,
        
        // Display elements
        title: "Edit Task",
        enable_associate: true,
        enable_completion_status: true,
        enable_week_select: true,

        // Callbacks
        save_callback: (edited_task: InflatedRecord.TgvNode) => { 
          this.database_manager_.tgv_set_basic_attributes(edited_task); 
        },
        delete_callback: (edited_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(edited_task); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnInit()
  {
    
  }

  ngOnChanges()
  {
    this.completed_ = !InflatedRecord.is_active(this.task);
    this.database_manager_.get_node(this.task.parent_id).then(parent => { this.task.parent = parent; });
  }

}
