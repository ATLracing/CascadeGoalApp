export enum Type
{
    TASK = 0,
    GOAL,
    VISION,
    DAY, 
    WEEK
}

export const DateIncomplete = undefined;
export const NullID = undefined;
export const GROUP_LOCAL: string[] = ["local"];
//export const NullID : ID = {type: -1, index: -1, group: []};

// Flexible ID type
export class ID
{
    type: Type;             // Record type
    index: number;          // Counting index; unique to group
    group: string[];        // User handles

    constructor(type: Type,
                index?: number,
                group?: string[])
    {
        this.type = type;
        this.index = index;
        this.group = group;
    }

    // Copy CTOR
    static copy(id?: ID): ID
    {
        if (id)
            return new ID(id.type, id.index, id.group);
        
        return undefined;
    }

    static array_copy(id_array?: ID[]) : ID[]
{
    if (!id_array)
        return undefined;
    
    let new_id_array = [];

    for (let id of id_array)
    {
        new_id_array.push(ID.copy(id));
    }

    return new_id_array;
}
}

export class TaskID extends ID
{
    constructor(index?: number,
                group?: string[])
    {
        super(Type.TASK, index, group);
    }
}

export class GoalID extends ID
{
    constructor(index?: number,
                group?: string[])
    {
        super(Type.GOAL, index, group);
    }
}

export class VisionID extends ID
{
    constructor(index?: number,
                group?: string[])
    {
        super(Type.VISION, index, group);
    }
}

export class DayID extends ID
{
    constructor(index?: number,
                group?: string[])
    {
        super(Type.DAY, index, group);
    }
}

export class WeekID extends ID
{
    constructor(index?: number,
                group?: string[])
    {
        super(Type.WEEK, index, group);
    }
}

export class Task
{
    // Basic attributes
    name: string;           // Simple description of the thing to be done
    details: string;        // Additional details for further reference
    date_created: Date;     // When the user entered the task
    date_completed: Date;   // When the user completed the task (undefined if incomplete)

    // Graph attributes
    parent_id: GoalID;
    unique_id: TaskID;

    constructor(name?: string, 
                details?: string, 
                date_created?: Date, 
                date_completed?: Date,
                parent_id?: GoalID,
                unique_id?: TaskID)
    {
        this.name = name;
        this.details = details;
        this.date_created = new Date(date_created);
        this.date_completed = new Date(date_completed);
        this.parent_id = ID.copy(parent_id);
        this.unique_id = ID.copy(unique_id);
    }

    static copy(task?: Task): Task
    {
        if (task)
            return new Task(task.name, task.details, task.date_created, task.date_completed, task.parent_id, task.unique_id);
        
        return undefined;
    }
}

// Middle node (whatever that's called)
// Basically a task right now, but I expect that will change
export class Goal
{
    // Basic attributes
    name: string;           // Simple description of the goal
    details: string         // Additional details for further reference
    date_created: Date;     // When the user entered the goal
    date_completed: Date;   // When the user completed the goal (undefined if incomplete)

    // Graph attributes
    parent_id: VisionID;
    child_ids: TaskID[];
    unique_id: GoalID;

    constructor(name?: string, 
                details?: string, 
                date_created?: Date, 
                date_completed?: Date,
                parent_id?: VisionID,
                child_ids?: TaskID[],
                unique_id?: GoalID)
    {
        this.name = name;
        this.details = details;
        this.date_created = new Date(date_created);
        this.date_completed = new Date(date_completed);
        this.parent_id = ID.copy(parent_id);
        this.child_ids = ID.array_copy(child_ids);
        this.unique_id = ID.copy(unique_id);
    }

    // Copy CTOR
    static copy(goal?: Goal): Goal
    {
        if (goal)
            return new Goal(goal.name, goal.details, goal.date_created, goal.date_completed, goal.parent_id, goal.child_ids, goal.unique_id);
        
        return undefined
    }
}

// Root node
// Basically just a category
export class Vision
{
    // Basic attributes
    name: string;           // Simple description
    details: string         // Additional details for further reference
    date_created: Date;     // When the user entered the vision
    date_completed: Date;   // When the user completed the vision (undefined if incomplete)

    // Graph attributes
    child_ids: GoalID[];
    unique_id: VisionID;

    // Copy CTOR
    constructor(name?: string, 
                details?: string, 
                date_created?: Date, 
                date_completed?: Date,
                child_ids?: GoalID[],
                unique_id?: VisionID)
    {
        this.name = name;
        this.details = details;
        this.date_created = new Date(date_created);
        this.date_completed = new Date(date_completed);
        this.child_ids = ID.array_copy(child_ids);
        this.unique_id = ID.copy(unique_id);
    }

    // Copy CTOR
    static copy(vision?: Vision): Vision
    {
        if (vision)
            return new Vision(vision.name, vision.details, vision.date_created, vision.date_completed, vision.child_ids, vision.unique_id);
        
        return undefined;
    }
}

export class Day
{
    date: Date;
    task_ids: TaskID[];
    previous_id: DayID;
    week_id: WeekID;
    unique_id: DayID;

    constructor(date?: Date,
                task_ids?: TaskID[],
                previous_id?: DayID,
                week_id?: WeekID,
                unique_id?: DayID)
    {
        this.date = new Date(date);
        this.task_ids = ID.array_copy(task_ids);
        this.previous_id = ID.copy(previous_id);
        this.week_id = ID.copy(week_id);
        this.unique_id = ID.copy(unique_id);
    }

    // Copy CTOR
    static copy(day?: Day): Day
    {
        if (day)
            return new Day(day.date, day.task_ids, day.previous_id, day.week_id, day.unique_id);

        return undefined;
    }
}

export class Week
{
    date: Date;             // TODO: needed?
    task_ids: TaskID[];
    day_ids: DayID[];
    previous_id: WeekID;
    unique_id: WeekID;

    constructor(date?: Date,
                task_ids?: TaskID[],
                day_ids?: DayID[],
                previous_id?: WeekID,
                unique_id?: WeekID)
    {
        this.date = new Date(date);
        this.task_ids = ID.array_copy(task_ids);
        this.day_ids = ID.array_copy(day_ids);
        this.previous_id = ID.copy(previous_id);
        this.unique_id = ID.copy(unique_id);
    }

    // Copy CTOR
    static copy(week?: Week): Week
    {
        if (week)
            return new Week(week.date, week.task_ids, week.day_ids, week.previous_id, week.unique_id);

        return undefined;
    }
}