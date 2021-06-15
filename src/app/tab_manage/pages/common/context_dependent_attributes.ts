import { get_level, DiscreteDateLevel, contains } from "src/app/providers/discrete_date";
import * as InflatedRecord from "src/app/providers/inflated_record" 
import { ContextDependentTaskAttributes, ContextDependentTaskAttributesLhs } from 'src/app/tab_day/components/task-list-item/task-list-item.component';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { DatabaseManager } from 'src/app/providers/database_manager';

export function get_manage_attributes(node: InflatedRecord.TgvNode, calendar_manager: CalendarManager) : ContextDependentTaskAttributes
{
  // Determine attributes
  let this_week = calendar_manager.get_active_week();

  let is_active = InflatedRecord.is_active(node);
  let due_this_week = contains(node.discrete_date, this_week);
  let overdue = InflatedRecord.is_overdue(node);
  let completed_this_week = contains(node.discrete_date_completed, this_week);

  let assigned_to_week = get_level(node.discrete_date) >= DiscreteDateLevel.WEEK || !is_active;
  let assigned_to_active_week = due_this_week || overdue || completed_this_week;

  return { assigned_lhs: assigned_to_week,
           assigned_active_lhs: assigned_to_active_week,
           type_lhs: ContextDependentTaskAttributesLhs.WEEK
          };
}

export function manage_add_remove_week(node: InflatedRecord.TgvNode, 
                                       database_manager: DatabaseManager, 
                                       calendar_manager: CalendarManager)
{
  if (get_level(node.discrete_date) >= DiscreteDateLevel.WEEK)
  {
    InflatedRecord.clear_week(node);
  }
  else
  {
    InflatedRecord.set_date(calendar_manager.get_active_week(), node);
  }

  database_manager.tgv_set_basic_attributes(node);
}