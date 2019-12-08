import { DatabaseManager } from './database_manager'
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { CSet } from './custom_id_set';

export class TaskFilter
{
    static all()
    {
        return (task: PackedRecord.Task) => { return true };
    }

    static none()
    {
        return (task: PackedRecord.Task) => { return false };
    }

    static including(task_ids: PackedRecord.TaskID[])
    {
        let task_id_set = new CSet<PackedRecord.TaskID>(task_ids);
        return (task: PackedRecord.Task) => {
            return task_id_set.has(task.unique_id);
        };
    }

    static excluding(task_ids: PackedRecord.TaskID[])
    {
        let task_id_set = new CSet<PackedRecord.TaskID>(task_ids);
        return (task: PackedRecord.Task) => {
            return !task_id_set.has(task.unique_id);
        }; 
    }

    static active()
    {
        return (task: PackedRecord.Task) => { 
            return task.date_completed == undefined;
        };
    }
}

export class GoalFilter
{
    static all()
    {
        return (goal: InflatedRecord.Goal) => { return true };
    }

    static none()
    {
        return (goal: InflatedRecord.Goal) => { return false };
    }

    static populated()
    {
        return (goal: InflatedRecord.Goal) => { return goal.child_tasks.length > 0 };
    }
}

// TODO(ABurroughs): This is inefficient and unintuitive. Filtering should be performed at the
// DatabaseManager level.
export class DatabaseInflator
{
    static query_tasks(database_manager: DatabaseManager, 
                       task_filter?: (task: PackedRecord.Task) => boolean): InflatedRecord.Task[]
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        let expanded_tasks: InflatedRecord.Task[] = [];

        for (let task of database_manager.get_tasks())
        {
            if (task_filter(task))
            {
                let expanded_task = new InflatedRecord.Task(task, database_manager);
                expanded_tasks.push(expanded_task);
            }
        }

        return expanded_tasks;
    }

    static query_goals(database_manager: DatabaseManager, 
                       goal_filter?: (goal: InflatedRecord.Goal) => boolean, 
                       task_filter?: (task: PackedRecord.Task) => boolean): InflatedRecord.Goal[]
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        if (goal_filter == undefined)
            goal_filter = GoalFilter.all();

        let expanded_goals: InflatedRecord.Goal[] = [];

        for (let goal of database_manager.get_goals())
        {
            let expanded_goal = new InflatedRecord.Goal(goal, task_filter, database_manager);
            
            if (goal_filter(expanded_goal))
            {
                expanded_goals.push(expanded_goal);
            }
        }

        return expanded_goals;
    }

    // TODO: No need for vision filter I imagine..
    static query_visions(database_manager: DatabaseManager, 
                         goal_filter?: (goal: InflatedRecord.Goal) => boolean, 
                         task_filter?: (task: PackedRecord.Task) => boolean): InflatedRecord.Vision[]
    {
        if (task_filter == undefined)
            task_filter = TaskFilter.all();

        if (goal_filter == undefined)
            goal_filter = GoalFilter.all();

        let expanded_visions: InflatedRecord.Vision[] = [];

        for (let vision of database_manager.get_visions())
        {
            let expanded_vision = new InflatedRecord.Vision(vision, goal_filter, task_filter, database_manager);
            expanded_visions.push(expanded_vision);
        }

        return expanded_visions;
    }
}