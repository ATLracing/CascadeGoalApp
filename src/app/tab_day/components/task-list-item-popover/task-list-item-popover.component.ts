import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ContextDependentTaskAttributes, ContextDependentTaskAttributesLhs } from '../task-list-item/task-list-item.component';

export class TaskListDropdownArguments
{
  task_attributes : ContextDependentTaskAttributes;
  add_remove_disabled : boolean;
}

@Component({
  selector: 'app-task-list-item-popover',
  templateUrl: './task-list-item-popover.component.html',
  styleUrls: ['./task-list-item-popover.component.scss'],
})
export class TaskListItemPopoverComponent implements OnInit {
  arguments_ : TaskListDropdownArguments;
  
  add_remove_text_ : string;
  add_remove_lhs_disabled_ : boolean;

  constructor(private addressed_transfer_ : AddressedTransfer,
              private popover_controller_ : PopoverController) { }

  ngOnInit() {
    this.arguments_ = this.addressed_transfer_.get("task-list-item-dropdown-assigned");
    
    let attributes = this.arguments_.task_attributes;

    this.add_remove_lhs_disabled_ = attributes.type_lhs == ContextDependentTaskAttributesLhs.NONE || this.arguments_.add_remove_disabled;

    let lhs_string = attributes.type_lhs == ContextDependentTaskAttributesLhs.DAY ? "day" : "week";
    this.add_remove_text_ = (attributes.assigned_lhs ? "Remove from " : "Add to ") + lhs_string;
  }

  edit()
  {
    this.popover_controller_.dismiss({}, "edit");
  }

  add_remove_lhs()
  {
    this.popover_controller_.dismiss({}, "add_remove_lhs");
  }
}
