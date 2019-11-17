import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage';
import { example_db_image } from './example_db'
import { CalendarManager } from './calendar_manager';

// These structures will be stringified and added to a database
// Tasks, goals, and visions will never be deleted, so unique ids will correspond to indices in
// their respective database arrays.

// Leaf node
export class Task
{
    // Required data
    name: string;           // Simple description of the thing to be done
    date_created: Date;     // When the user entered the task
    date_completed: Date;   // When the user completed the task (undefined if incomplete)
    date_cancelled: Date;   // When the user cancelled the task (undefined if not cancelled)

    // Optional data
    details: string         // Additional details for further reference

    // Implementation
    unique_id: number;
    parent_id: number;

    constructor(other: Task)
    {
        // Goal fields
        this.name = other.name;
        this.date_created = other.date_created;
        this.date_completed = other.date_completed;
        this.date_cancelled = other.date_cancelled;
        
        this.details = other.details;
        this.unique_id = other.unique_id;
        this.parent_id = other.parent_id;
    }
}

// Middle node (whatever that's called)
// Basically a task right now, but I expect that will change
export class Goal
{
    // Required data
    name: string;           // Simple description of the goal
    date_created: Date;     // When the user entered the goal
    date_completed: Date;   // When the user completed the goal (undefined if incomplete)
    date_cancelled: Date;   // When the user cancelled the goal (undefined if not cancelled)

    // Optional data
    details: string         // Additional details for further reference

    // Implementation
    unique_id: number;
    parent_id: number;
    child_ids: number[];

    constructor(other: Goal)
    {
        // Goal fields
        this.name = other.name;
        this.date_created = other.date_created;
        this.date_completed = other.date_completed;
        this.date_cancelled = other.date_cancelled;
        
        this.details = other.details;
        this.unique_id = other.unique_id;
        this.parent_id = other.parent_id;
        this.child_ids = other.child_ids.slice();
    }
}

// Root node
// Basically just a category
export class Vision
{
    // Required data
    name: string;           // Simple description of the thing to be done
    date_created: Date;     // When the user entered the vision
    date_completed: Date;   // When the user completed the vision (undefined if incomplete)
    date_cancelled: Date;   // When the user cancelled the vision (undefined if not cancelled)

    // Optional data
    details: string         // Additional details for further reference

    // Implementation
    unique_id: number;
    child_ids: number[];

    constructor(other: Vision)
    {
        // Vision fields
        this.name = other.name;
        this.date_created = other.date_created;
        this.date_completed = other.date_completed;
        this.date_cancelled = other.date_cancelled;
        this.details = other.details;
        this.unique_id = other.unique_id;
        this.child_ids = other.child_ids.slice();
    }
}

export class Day
{
    date: Date;
    task_ids: number[];
    unique_id: number;
    parent_id: number;
    last_day_id: number;

    constructor(other: Day)
    {
        this.date = other.date;
        this.task_ids = other.task_ids.slice();
        this.unique_id = other.unique_id;
    }
}

export class Week
{
    date: Date;         // Monday
    task_ids: number[];
    day_ids: number[];
    unique_id: number;
    last_week_id: number;

    constructor(other: Week)
    {
        this.date = other.date;
        this.task_ids = other.task_ids.slice();
        this.day_ids = other.day_ids.slice();
        this.unique_id = other.unique_id;
    }
}

const KEY_DATABASE_IMAGE = "key_database_image";
export class DatabaseImage
{
    version: number;

    tasks: Task[];
    goals: Goal[];
    visions: Vision[];

    days: Day[];
    weeks: Week[];

    most_recent_day_id: number;
    next_available_id: number;  // IDs will be globally unique. Should help catch errors.
}

class LoadedDatabaseImage
{
    version: number;
    next_available_id: number;

    tasks: Map<number, Task>;
    goals: Map<number, Goal>;
    visions: Map<number, Vision>;

    days: Map<number, Day>;
    weeks: Map<number, Week>;

    most_recent_day_id: number;

    constructor(database_image: DatabaseImage)
    {
        this.version = database_image.version;
        this.next_available_id = database_image.next_available_id;
        this.most_recent_day_id = database_image.most_recent_day_id;

        this.tasks = new Map<number, Task>();
        this.goals = new Map<number, Goal>();
        this.visions = new Map<number, Vision>();
        this.days = new Map<number, Day>();
        this.weeks = new Map<number, Week>();

        // Tasks
        for (let task of database_image.tasks)
        {
            this.tasks.set(task.unique_id, task);
        }

        // Goals
        for (let goal of database_image.goals)
        {
            this.goals.set(goal.unique_id, goal);
        }

        // Visions
        for (let vision of database_image.visions)
        {
            this.visions.set(vision.unique_id, vision);
        }

        // Days
        for (let day of database_image.days)
        {
            this.days.set(day.unique_id, day);
        }

        // Weeks
        for (let week of database_image.weeks)
        {
            this.weeks.set(week.unique_id, week);
        }
    }

    getImage(): DatabaseImage
    {
        let image: DatabaseImage = {
            version: this.version,
            next_available_id: this.next_available_id,
            tasks: Array.from(this.tasks.values()),
            goals: Array.from(this.goals.values()),
            visions: Array.from(this.visions.values()),
            days: Array.from(this.days.values()),
            weeks: Array.from(this.weeks.values()),
            most_recent_day_id: this.most_recent_day_id
        };

        return image;
    }
}

// Read only
export class DatabaseImageDelegate
{
    private database_image_: LoadedDatabaseImage;

    constructor(database_image: LoadedDatabaseImage)
    {
        this.database_image_ = database_image;
    }

    get_task(unique_id: number): Task
    {
        return this.database_image_.tasks.get(unique_id);
    }
    get_goal(unique_id: number): Goal
    {
        return this.database_image_.goals.get(unique_id);
    }
    get_vision(unique_id: number): Vision
    {
        return this.database_image_.visions.get(unique_id);
    }
    get_day(unique_id: number): Day
    {
        return this.database_image_.days.get(unique_id);
    }
    get_week(unique_id: number): Week
    {
        return this.database_image_.weeks.get(unique_id);
    }

    get_tasks(): Task[]
    {
        return Array.from(this.database_image_.tasks.values());
    }

    get_goals(): Goal[]
    {
        return Array.from(this.database_image_.goals.values());
    }

    get_visions(): Vision[]
    {
        return Array.from(this.database_image_.visions.values());
    }

    get_days(): Day[]
    {
        return Array.from(this.database_image_.days.values());
    }

    get_weeks(): Week[]
    {
        return Array.from(this.database_image_.weeks.values());
    }
    get_most_recent_day(): Day
    {
        return this.database_image_.days.get(this.database_image_.most_recent_day_id);
    }
    get_most_recent_week(): Week
    {
        return this.database_image_.weeks.get(this.get_most_recent_day().parent_id);
    }
}

let empty_db : DatabaseImage = {
    version: 1,
    
    tasks: [],
    goals: [],
    visions: [],

    days: [],
    weeks: [],

    most_recent_day_id: 0,
    next_available_id: 0
}

// Full read/write strategy
@Injectable()
export class DatabaseManager
{
    private static database_data: LoadedDatabaseImage;
    private static data_updated_callbacks: Map<string, any>;
    private static initialized;
    private static loaded;

    constructor(private storage_: Storage)
    {
        if (!DatabaseManager.initialized)
        {
            DatabaseManager.database_data = new LoadedDatabaseImage(empty_db);
            DatabaseManager.data_updated_callbacks = new Map<string, any>();

            DatabaseManager.loaded = false;
            DatabaseManager.initialized = true;

            this.read_db();
        }
    }

    private read_db()
    {
        let database_image = example_db_image;
        DatabaseManager.database_data = new LoadedDatabaseImage(database_image);
        DatabaseManager.loaded = true;
        DatabaseManager.execute_data_updated_callbacks();
        
        // THEN
        // start loop
        CalendarManager.calendar_loop(this);
        
        /*
        return new Promise((resolve, error) => {
            this.storage_.get(KEY_DATABASE_IMAGE).then((db_image) =>
            {
                if (db_image)
                {
                    DatabaseManager.database_data = JSON.parse(db_image);

                    DatabaseManager.execute_data_updated_callbacks();
                    // Resolve (should use return codes or something)
                    resolve("Success");
                }
                else
                {
                    DatabaseManager.database_data = example_db_image;
                    this.save_results().then((msg) => {
                        return this.read_db();
                    });
                }
            });
        });
        */
    }

    save_results()
    {
        return this.storage_.set(KEY_DATABASE_IMAGE, JSON.stringify(DatabaseManager.database_data.getImage()));
    }

    private static execute_data_updated_callbacks(no_callbacks?: boolean)
    {
        if (no_callbacks)
            return;
        
        // The compiler wants an array here. Not sure why.
        let callback_array = Array.from(DatabaseManager.data_updated_callbacks.values());
        for (let callback of callback_array)
        {
            callback();
        }
    }

    register_data_updated_callback(name: string, callback_function: any)
    {
        DatabaseManager.data_updated_callbacks.set(name, callback_function);
        
        if (DatabaseManager.loaded)
            callback_function();
    }

    unregister_data_updated_callback(name: string)
    {
        DatabaseManager.data_updated_callbacks.delete(name);
    }

    get_image_delegate()
    {
        return new DatabaseImageDelegate(DatabaseManager.database_data);
    }

    add_task(task: Task, no_callbacks?: boolean) : number
    {
        // Copy for safety
        let copy = JSON.parse(JSON.stringify(task));
        
        // Assign date and unique ID
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.next_available_id++;
        
        // Add to parent element
        if (copy.parent_id != undefined)
        {
            let parent = DatabaseManager.database_data.goals.get(copy.parent_id);
            
            if (parent.child_ids == undefined)
                parent.child_ids = [];
            
            parent.child_ids.push(copy.unique_id);
        }

        DatabaseManager.database_data.tasks.set(copy.unique_id, copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    add_goal(goal: Goal, no_callbacks?: boolean) : number
    {
        // Copy for safety
        let copy = JSON.parse(JSON.stringify(goal));

        // Assign date and unique ID
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.next_available_id++;

        // Add to parent element
        if (copy.parent_id != undefined)
        {
            let parent = DatabaseManager.database_data.visions[copy.parent_id];
            
            if (parent.child_ids == undefined)
                parent.child_ids = [];
            
            parent.child_ids.push(copy.unique_id);
        }

        DatabaseManager.database_data.goals.set(copy.unique_id, copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    add_vision(vision: Goal, no_callbacks?: boolean) : number
    {
        let copy = JSON.parse(JSON.stringify(vision));
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.next_available_id++;
        DatabaseManager.database_data.visions.set(copy.unique_id, copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    add_day(day: Day, no_callbacks?: boolean) : number
    {
        let copy = JSON.parse(JSON.stringify(day));
        copy.date = new Date();
        copy.unique_id = DatabaseManager.database_data.next_available_id++;;
        DatabaseManager.database_data.days.set(copy.unique_id, copy);
        
        // Add to parent element
        if (copy.parent_id != undefined)
        {
            let parent_week = DatabaseManager.database_data.weeks.get(copy.parent_id);
            
            if (parent_week.day_ids == undefined)
                parent_week.day_ids = [];
            
            parent_week.day_ids.push(copy.unique_id);
        }

        // Link to last day
        if (DatabaseManager.database_data.most_recent_day_id != undefined)
        {
            copy.last_day_id = DatabaseManager.database_data.most_recent_day_id;
        }

        // Update most recent day
        DatabaseManager.database_data.most_recent_day_id = copy.unique_id;
        
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    set_day(day: Day, no_callbacks?: boolean)
    {
        let copy = JSON.parse(JSON.stringify(day));
        DatabaseManager.database_data.days[day.unique_id] = copy;
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    add_week(week: Week, no_callbacks?: boolean) : number
    {
        let copy = JSON.parse(JSON.stringify(week));
        copy.date = new Date();
        copy.unique_id = DatabaseManager.database_data.next_available_id++;;
        DatabaseManager.database_data.weeks.set(copy.unique_id, copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    set_week(week: Week, no_callbacks?: boolean)
    {
        let copy = JSON.parse(JSON.stringify(week));
        DatabaseManager.database_data.weeks.set(week.unique_id, copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    toggle_task_completion(unique_id: number, no_callbacks?: boolean)
    {
        let task = DatabaseManager.database_data.tasks.get(unique_id);

        if (task.date_completed == undefined)
            task.date_completed = new Date();
        else
            task.date_completed = undefined;
            
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    add_task_to_day(day_id: number, task_id: number, no_callbacks?: boolean)
    {
        DatabaseManager.database_data.days.get(day_id).task_ids.push(task_id);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    add_tasks_to_day(day_id: number, task_ids: number[], no_callbacks?: boolean)
    {
        DatabaseManager.database_data.days.get(day_id).task_ids =
            DatabaseManager.database_data.days.get(day_id).task_ids.concat(task_ids);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    remove_task_from_day(day_id: number, remove_task_id: number, no_callbacks?: boolean)
    {
        let day_task_ids = DatabaseManager.database_data.days.get(day_id).task_ids;

        let remove_index = day_task_ids.findIndex((task_id) => { return task_id == remove_task_id });
        day_task_ids.splice(remove_index, 1);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    add_task_to_week(week_id: number, task_id: number, no_callbacks?: boolean)
    {
        DatabaseManager.database_data.weeks.get(week_id).task_ids.push(task_id);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    add_tasks_to_week(week_id: number, task_ids: number[], no_callbacks?: boolean)
    {
        DatabaseManager.database_data.weeks.get(week_id).task_ids = 
            DatabaseManager.database_data.weeks.get(week_id).task_ids.concat(task_ids);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    remove_task_from_week(week_id: number, day_id: number, remove_task_id: number, no_callbacks?: boolean)
    {
        // Remove from week
        let week_task_ids = DatabaseManager.database_data.weeks.get(week_id).task_ids;

        let remove_index = week_task_ids.findIndex((task_id) => { return task_id == remove_task_id });
        week_task_ids.splice(remove_index, 1);
        
        // Remove from day
        this.remove_task_from_day(day_id, remove_task_id);
    }
}

export class DatabaseHelper
{
    static create_blank_task() : Task
    {
        return {
            // Required data
            name: undefined,
            date_created: undefined,
            date_completed: undefined,
            date_cancelled: undefined,
        
            // Optional data
            details: undefined,
        
            // Implementation
            unique_id: undefined,
            parent_id: undefined
        } 
    }

    static create_blank_goal() : Goal
    {
        return {
            // Required data
            name: undefined,
            date_created: undefined,
            date_completed: undefined,
            date_cancelled: undefined,
        
            // Optional data
            details: undefined,
        
            // Implementation
            unique_id: undefined,
            parent_id: undefined,
            child_ids: []
        } 
    }

    static create_blank_vision() : Vision
    {
        return {
            // Required data
            name: undefined,
            date_created: undefined,
            date_completed: undefined,
            date_cancelled: undefined,
        
            // Optional data
            details: undefined,
        
            // Implementation
            unique_id: undefined,
            child_ids: []
        } 
    }

    static create_blank_day(): Day
    {
        let new_day : Day = {
            date: undefined,
            task_ids: [],
            unique_id: undefined,
            parent_id: undefined,
            last_day_id: undefined
        };

        return new_day;
    }

    static create_blank_week(): Week
    {
        let new_week: Week = {
            date: undefined,
            task_ids: [],
            day_ids: [],
            unique_id: undefined,
            last_week_id: undefined
        };

        return new_week;
    }
}