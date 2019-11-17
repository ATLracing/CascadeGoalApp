import { Task, Goal, Vision, DatabaseManager, Day, DatabaseImageDelegate, Week } from './database_manager'

// ================================================================================== Expanded Nodes
export class ExpandedTask extends Task
{
  goal: Goal;
  vision: Vision;
  extra: any;       // Components can tack on bindable UI data here

  constructor(task: Task, database_image: DatabaseImageDelegate)
  {
    super(task);
    
    if (this.parent_id != undefined)
      this.goal = JSON.parse(JSON.stringify(database_image.get_goal(task.parent_id)));
    else
      this.goal = undefined;
    
    if (this.goal != undefined && this.goal.parent_id != undefined)
      this.vision = JSON.parse(JSON.stringify(database_image.get_vision(this.goal.parent_id)));
    else
      this.vision = undefined;
  }

  getTask(): Task
  {
    return new Task(this);
  }
}

export class ExpandedGoal extends Goal
{
    vision: Vision;
    child_tasks: ExpandedTask[];
    extra: any;       // Components can tack on bindable UI data here

    // Full
    constructor(goal: Goal, task_filter: (task: Task) => boolean, database_image: DatabaseImageDelegate)
    {
        // Copy construct
        super(goal);

        // Expanded fields
        if (goal.parent_id != undefined)
            this.vision = JSON.parse(JSON.stringify(database_image.get_vision(this.parent_id)));
        
        this.child_tasks = [];
        for (let child_id of goal.child_ids)
        {
            let task = database_image.get_task(child_id);

            if (task_filter(task))
            {
                this.child_tasks.push(new ExpandedTask(task, database_image));
            }
        }
    }

  getGoal(): Goal
  {
    return new Goal(this);
  }
}

export class ExpandedVision extends Vision
{
    child_goals: ExpandedGoal[];

    constructor(vision: Vision, goal_filter: (goal: ExpandedGoal) => boolean, task_filter: (task: Task) => boolean, database_image: DatabaseImageDelegate)
    {
        // Copy construct
        super(vision);

        this.child_goals = [];
        
        // Build the tree
        for (let goal_id of this.child_ids)
        {
            let goal = database_image.get_goal(goal_id);
            let expanded_goal = new ExpandedGoal(goal, task_filter, database_image);

            if (goal_filter(expanded_goal))
            {
                this.child_goals.push(expanded_goal);
            }
        }
    }

    getVision(): Vision
    {
        return new Vision(this);
    }
}

// Adds expanded parameter in ExpandedDay
export class ExpandedDay extends Day
{
    week: Week;
    tasks: ExpandedTask[];
    extra: any;

    constructor(day: Day, task_filter: (task: Task) => boolean, database_image: DatabaseImageDelegate)
    {
        super(day);

        this.week = database_image.get_week(day.parent_id);

        this.tasks = [];

        // Create a map of the last day's tasks (empty if there is no previous day)
        let last_day_tasks = new Map<number, Task>();

        if (this.last_day_id != undefined)
        {
            let last_day = database_image.get_day(this.last_day_id);
            for (let task_id of last_day.task_ids)
            {
                last_day_tasks.set(task_id, database_image.get_task(task_id));
            }
        }

        for (let task_id of this.task_ids)
        {
            let task = database_image.get_task(task_id);

            if (task_filter(task))
            {
                let expanded_task = new ExpandedTask(task, database_image);
                let carried = last_day_tasks.has(task.unique_id) && 
                    last_day_tasks.get(task.unique_id).date_completed == undefined;

                expanded_task.extra = { carried: carried };
                
                this.tasks.push(expanded_task);
            }
        }
    }
}

export class ExpandedWeek extends Week
{
    tasks: ExpandedTask[];
    days: ExpandedDay[];
    today: Day;
    extra: any;

    constructor(week: Week, task_filter: (Task) => boolean, database_image: DatabaseImageDelegate)
    {
        super(week);

        this.tasks = []
        this.days = [];

        // Inflate tasks
        for (let task_id of week.task_ids)
        {
            let task = database_image.get_task(task_id);

            if (task_filter(task))
                this.tasks.push(new ExpandedTask(task, database_image));
        }

        let most_recent_day = 0;
        // Inflate days
        for (let day_id of week.day_ids)
        {
            let day = database_image.get_day(day_id);

            if (day.date.getDay() > most_recent_day)
            {
                most_recent_day = day.date.getDay();
                this.today = day;
            }

            this.days.push(new ExpandedDay(day, task_filter, database_image));
        }
    }
}

export class TaskFilter
{
    static all()
    {
        return (task: Task) => { return true };
    }

    static none()
    {
        return (task: Task) => { return false };
    }

    static including(task_ids: number[])
    {
        let task_id_set = new Set<number>(task_ids);
        return (task: Task) => {
            return task_id_set.has(task.unique_id);
        };
    }

    static excluding(task_ids: number[])
    {
        let task_id_set = new Set<number>(task_ids);
        return (task: Task) => {
            return !task_id_set.has(task.unique_id);
        }; 
    }

    static active()
    {
        return (task: Task) => { 
            return task.date_completed == undefined && task.date_cancelled == undefined;
        };
    }
}

export class GoalFilter
{
    static all()
    {
        return (goal: ExpandedGoal) => { return true };
    }

    static none()
    {
        return (goal: ExpandedGoal) => { return false };
    }

    static populated()
    {
        return (goal: ExpandedGoal) => { return goal.child_tasks.length > 0 };
    }
}

export class DatabaseInflator
{
    static query_tasks(database_manager: DatabaseManager, task_filter?: (task: Task) => boolean)
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        let database_image = database_manager.get_image_delegate();

        let expanded_tasks = [];

        for (let task of database_image.get_tasks())
        {
            if (task_filter(task))
            {
                let expanded_task = new ExpandedTask(task, database_image);
                expanded_tasks.push(expanded_task);
            }
        }

        return expanded_tasks;
    }

    static query_goals(database_manager: DatabaseManager, goal_filter?: (goal: ExpandedGoal) => boolean, task_filter?: (task: Task) => boolean)
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        if (goal_filter == undefined)
            goal_filter = GoalFilter.all();

        let database_image = database_manager.get_image_delegate();
        let expanded_goals = [];

        for (let goal of database_image.get_goals())
        {
            let expanded_goal = new ExpandedGoal(goal, task_filter, database_image);
            
            if (goal_filter(expanded_goal))
            {
                expanded_goals.push(expanded_goal);
            }
        }

        return expanded_goals;
    }

    // TODO: No need for vision filter I imagine..
    static query_visions(database_manager: DatabaseManager, goal_filter?: (goal: Goal) => boolean, task_filter?: (task: Task) => boolean)
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        if (goal_filter == undefined)
            goal_filter = GoalFilter.all();

        let database_image = database_manager.get_image_delegate();
        let expanded_visions = [];

        for (let vision of database_image.get_visions())
        {
            let expanded_vision = new ExpandedVision(vision, goal_filter, task_filter, database_image);
            expanded_visions.push(expanded_vision);
        }

        return expanded_visions;
    }
}