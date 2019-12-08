 /*
 * --------------------------------------- Brief design note ---------------------------------------
 * The contents of this namespace are a bit ad hoc and ought to be refined/formalized. For now, 
 * inflated records inflate all nodes beneath them recursively (with optional filtering capabilities 
 * that aren't super efficient). Inflated records inflate nodes above them non-recursively.
 */

import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { DatabaseManager } from 'src/app/providers/database_manager'
import { CMap } from './custom_id_map';

export class Task extends PackedRecord.Task
{
  goal: PackedRecord.Goal;
  vision: PackedRecord.Vision;
  extra: any;       // Components can tack on bindable UI data here

  constructor(task: PackedRecord.Task, database_manager: DatabaseManager)
  {
    super(task.name, task.details, task.date_created, task.date_completed, task.parent_id, task.unique_id);
    
    if (this.parent_id != undefined)
      this.goal = database_manager.get_goal(task.parent_id);
    else
      this.goal = undefined;
    
    if (this.goal != undefined && this.goal.parent_id != undefined)
      this.vision = database_manager.get_vision(this.goal.parent_id);
    else
      this.vision = undefined;
  }
}

export class Goal extends PackedRecord.Goal
{
    vision: PackedRecord.Vision;
    child_tasks: InflatedRecord.Task[];
    extra: any;       // Components can tack on bindable UI data here

    // Full
    constructor(goal: PackedRecord.Goal, task_filter: (task: PackedRecord.Task) => boolean, database_manager: DatabaseManager)
    {
        // Copy construct
        super(goal.name, goal.details, goal.date_created, goal.date_completed, goal.parent_id, goal.child_ids, goal.unique_id);

        // Expanded fields
        if (goal.parent_id != undefined)
            this.vision = JSON.parse(JSON.stringify(database_manager.get_vision(this.parent_id)));
        
        this.child_tasks = [];
        for (let child_id of goal.child_ids)
        {
            let task = database_manager.get_task(child_id);

            if (task_filter(task))
            {
                this.child_tasks.push(new InflatedRecord.Task(task, database_manager));
            }
        }
    }
}

export class Vision extends PackedRecord.Vision
{
    child_goals: InflatedRecord.Goal[];
    extra: any;       // Components can tack on bindable UI data here

    constructor(vision: PackedRecord.Vision, goal_filter: (goal: InflatedRecord.Goal) => boolean, task_filter: (task: PackedRecord.Task) => boolean, database_manager: DatabaseManager)
    {
        // Copy construct
        super(vision.name, vision.details, vision.date_created, vision.date_completed, vision.child_ids, vision.unique_id);

        this.child_goals = [];
        
        // Build the tree
        for (let goal_id of this.child_ids)
        {
            let goal = database_manager.get_goal(goal_id);
            let expanded_goal = new InflatedRecord.Goal(goal, task_filter, database_manager);

            if (goal_filter(expanded_goal))
            {
                this.child_goals.push(expanded_goal);
            }
        }
    }
}

// Adds expanded parameter in ExpandedDay
export class Day extends PackedRecord.Day
{
    week: PackedRecord.Week;
    tasks: InflatedRecord.Task[];
    extra: any;

    constructor(day: PackedRecord.Day, task_filter: (task: PackedRecord.Task) => boolean, database_manager: DatabaseManager)
    {
        super(day.date, day.task_ids, day.previous_id, day.week_id, day.unique_id);

        this.week = database_manager.get_week(day.week_id);

        this.tasks = [];

        // Create a map of the last day's tasks (empty if there is no previous day)
        let last_day_tasks = new CMap<PackedRecord.TaskID, PackedRecord.Task>();

        if (this.previous_id != undefined)
        {
            let last_day = database_manager.get_day(this.previous_id);
            for (let task_id of last_day.task_ids)
            {
                last_day_tasks.set(task_id, database_manager.get_task(task_id));
            }
        }

        for (let task_id of this.task_ids)
        {
            let task = database_manager.get_task(task_id);

            if (task_filter(task))
            {
                let expanded_task = new InflatedRecord.Task(task, database_manager);
                let carried = last_day_tasks.has(task.unique_id) && 
                    last_day_tasks.get(task.unique_id).date_completed == undefined;

                expanded_task.extra = { carried: carried };
                
                this.tasks.push(expanded_task);
            }
        }
    }
}

export class Week extends PackedRecord.Week
{
    tasks: InflatedRecord.Task[];
    days: Day[];
    today: PackedRecord.Day;
    extra: any;

    constructor(week: Week, task_filter: (task: PackedRecord.Task) => boolean, database_manager: DatabaseManager)
    {
        super(week.date, week.task_ids, week.day_ids, week.previous_id, week.unique_id);

        this.tasks = []
        this.days = [];

        // Inflate tasks
        for (let task_id of week.task_ids)
        {
            let task = database_manager.get_task(task_id);

            if (task_filter(task))
                this.tasks.push(new InflatedRecord.Task(task, database_manager));
        }

        let most_recent_day = 0;
        // Inflate days
        for (let day_id of week.day_ids)
        {
            let day = database_manager.get_day(day_id);

            if (day.date.getDay() > most_recent_day)
            {
                most_recent_day = day.date.getDay();
                this.today = day;
            }

            this.days.push(new Day(day, task_filter, database_manager));
        }
    }
}