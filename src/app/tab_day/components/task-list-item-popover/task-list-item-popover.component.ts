import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { contains, DiscreteDate, DiscreteDateLevel, equals, get_level, get_this_week } from 'src/app/providers/discrete_date';
import { ContextDependentTaskAttributes, ContextDependentTaskAttributesTab } from '../task-list-item/task-list-item.component';
import { Task } from 'src/app/providers/inflated_record'

export class TaskListDropdownArguments
{
  task_attributes : ContextDependentTaskAttributes;
  add_remove_disabled : boolean;
  task: Task;
}

@Component({
  selector: 'app-task-list-item-popover',
  templateUrl: './task-list-item-popover.component.html',
  styleUrls: ['./task-list-item-popover.component.scss'],
})
export class TaskListItemPopoverComponent implements OnInit {
  arguments_ : TaskListDropdownArguments;
  
  remove_text_ : string;
  remove_disabled_ : boolean;

  add_remove_lhs_text_ : string;
  add_remove_lhs_disabled_ : boolean;

  constructor(private addressed_transfer_ : AddressedTransfer,
              private popover_controller_ : PopoverController,
              private calendar_manager_: CalendarManager) { }

  ngOnInit() {
    this.arguments_ = this.addressed_transfer_.get("task-list-item-dropdown-assigned");
    let attributes = this.arguments_.task_attributes;
    let task_date = this.arguments_.task.discrete_date;

    let active_week = this.calendar_manager_.get_active_week();

    this.remove_disabled_ = this.arguments_.add_remove_disabled;
    this.add_remove_lhs_disabled_ = this.arguments_.add_remove_disabled;
    
    if (attributes.tab == ContextDependentTaskAttributesTab.MANAGE)
    {
      this.remove_disabled_ = true;
      this.add_remove_lhs_text_ = this.add_remove_week_string(task_date);
    }
    else if (attributes.tab == ContextDependentTaskAttributesTab.WEEK)
    {
      this.remove_text_ = this.add_remove_week_string(task_date);

      this.add_remove_lhs_disabled_ = this.add_remove_lhs_disabled_ || !equals(active_week, get_this_week());
      this.add_remove_lhs_text_ = this.add_remove_today_string(task_date);
    }
    else // DAY
    {
      this.add_remove_lhs_disabled_ = true;
      this.remove_text_ = this.add_remove_today_string(task_date);
    }
  }

  edit()
  {
    this.popover_controller_.dismiss({}, "edit");
  }

  remove()
  {
    this.popover_controller_.dismiss({}, "remove");
  }

  add_remove_lhs()
  {
    this.popover_controller_.dismiss({}, "add_remove_lhs");
  }

  private add_remove_week_string(task_date : DiscreteDate) : string
  {
      let add = get_level(task_date) < DiscreteDateLevel.WEEK;
      let target_date : DiscreteDate = add ? this.calendar_manager_.get_active_week() : task_date;

      let week_string = contains(target_date, get_this_week()) ? "this week" : "Week " + target_date.week;

      return this.add_remove_string(add) + " " + week_string;
  }

  private add_remove_today_string(task_date : DiscreteDate) : string
  {
    let add = get_level(task_date) < DiscreteDateLevel.DAY;
    return this.add_remove_string(add) + " today";
  }

  private add_remove_string(add : boolean) : string
  {
    return add ? "Add to" : "Remove from";
  }
}
