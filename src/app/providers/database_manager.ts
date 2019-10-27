import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage';

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
}

export class Day
{
    date: Date;
    task_ids: number[];
    unique_id: number;
}

export class Week
{
    date: Date;         // Monday
    task_ids: number[];
    goal_ids: number[];
    unique_id: number;
}

export class Month
{
    data: Date;         // Day of the first
    goal_ids: number[];
    unique_id: number;
}

const KEY_DATABASE_IMAGE = "key_database_image";
class DataBaseImage
{
    version: number;

    tasks: Task[];
    goals: Goal[];
    visions: Vision[];

    days: Day[];
    weeks: Week[];
    months: Month[];
}

// ==================================================================================== EXAMPLE DATA 
// Visions
let example_vision_one = {
    name: "Financial Independence",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: "Quit the 9-5",

    // Implementation
    unique_id: 0,
    child_ids: [0, 1]
};

let example_vision_two = {
    name: "Find Soulmate",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: "Get a honey of a gal",

    // Implementation
    unique_id: 1,
    child_ids: [2]
};

// Goals
let example_goal_one = {
    name: "Get into crypto market",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 0,
    parent_id: 0,
    child_ids: [0, 1]
};

let example_goal_two = {
    name: "Learn Python market API",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 1,
    parent_id: 0,
    child_ids: [2]
};

let example_goal_three = {
    name: "Hit the club",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 2,
    parent_id: 1,
    child_ids: [3, 4]
};

let example_task_one = {
    name: "Create Bitcoin wallet",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 0,
    parent_id: 0,
};

let example_task_two = {
    name: "Create Ethereum wallet",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 1,
    parent_id: 0,
};

let example_task_three = {
    name: "Write basic Python stock price graphing app",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 2,
    parent_id: 1,
};

let example_task_four = {
    name: "Read Yelp club reviews and decide on venue",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 3,
    parent_id: 2,
};

let example_task_five = {
    name: "Buy styling gel",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 4,
    parent_id: 2,
};

let example_day_one = {
    date: new Date(),
    task_ids: [0, 1, 2],
    unique_id: 0
};

let example_db_image = {
    version: 1,
    
    tasks: [example_task_one, example_task_two, example_task_three, example_task_four, example_task_five],
    goals: [example_goal_one, example_goal_two, example_goal_three],
    visions: [example_vision_one, example_vision_two],

    days: [example_day_one],
    weeks: [],
    months: []
}

let empty_db = {
    version: 1,
    
    tasks: [],
    goals: [],
    visions: [],

    days: [],
    weeks: [],
    months: []
}

// Full read/write strategy
@Injectable()
export class DatabaseManager
{
    private static database_data: DataBaseImage;
    private static data_updated_callbacks: Map<string, any>;
    private static initialized;

    constructor(private storage_: Storage)
    {
        if (!DatabaseManager.initialized)
        {
            DatabaseManager.database_data = empty_db;

            DatabaseManager.initialized = true;
            DatabaseManager.data_updated_callbacks = new Map<string, any>();
            this.read_db();
        }
    }

    private read_db()
    {
        DatabaseManager.database_data = example_db_image;
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
        return this.storage_.set(KEY_DATABASE_IMAGE, JSON.stringify(DatabaseManager.database_data)).then(
            DatabaseManager.execute_data_updated_callbacks);
        
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
        callback_function();
    }

    unregister_data_updated_callback(name: string)
    {
        DatabaseManager.data_updated_callbacks.delete(name);
    }

    get_database_image
    // Database data specific methods (this is messy)
    get_tasks_copy()
    {
        return DatabaseManager.database_data.tasks.slice();
    }
    get_goals_copy()
    {
        return DatabaseManager.database_data.goals.slice();
    }
    get_visions_copy()
    {
        return DatabaseManager.database_data.visions.slice();
    }

    get_tasks_ref()
    {
        return DatabaseManager.database_data.tasks;
    }
    get_goals_ref()
    {
        return DatabaseManager.database_data.goals;
    }
    get_visions_ref()
    {
        return DatabaseManager.database_data.visions;
    }

    add_task(task: Task, no_callbacks?: boolean) : number
    {
        // Copy for safety
        let copy = JSON.parse(JSON.stringify(task));
        
        // Assign date and unique ID
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.tasks.length;
        
        // Add to parent element
        if (copy.parent_id != undefined)
        {
            let parent = DatabaseManager.database_data.goals[copy.parent_id];
            
            if (parent.child_ids == undefined)
                parent.child_ids = [];
            
            parent.child_ids.push(copy.unique_id);
        }

        DatabaseManager.database_data.tasks.push(copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }
    add_goal(goal: Goal, no_callbacks?: boolean) : number
    {
        // Copy for safety
        let copy = JSON.parse(JSON.stringify(goal));

        // Assign date and unique ID
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.goals.length;

        // Add to parent element
        if (copy.parent_id != undefined)
        {
            let parent = DatabaseManager.database_data.visions[copy.parent_id];
            
            if (parent.child_ids == undefined)
                parent.child_ids = [];
            
            parent.child_ids.push(copy.unique_id);
        }

        DatabaseManager.database_data.goals.push(copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }
    add_vision(vision: Goal, no_callbacks?: boolean) : number
    {
        let copy = JSON.parse(JSON.stringify(vision));
        copy.date_created = new Date();
        copy.unique_id = DatabaseManager.database_data.visions.length;
        DatabaseManager.database_data.visions.push(copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    add_day(day: Day, no_callbacks?: boolean) : number
    {
        let copy = JSON.parse(JSON.stringify(day));
        DatabaseManager.database_data.days.push(copy);
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return copy.unique_id;
    }

    set_day(day: Day, no_callbacks?: boolean)
    {
        let copy = JSON.parse(JSON.stringify(day));
        DatabaseManager.database_data.days[day.unique_id] = copy;
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    get_days_ref()
    {
        return DatabaseManager.database_data.days;
    }

    get_days_copy()
    {
        return DatabaseManager.database_data.days.slice();
    }
}

export class ExpandedTask
{
  task: Task;
  goal: Goal;
  vision: Vision;

  constructor(task: Task, all_goals: Goal[], all_visions: Vision[])
  {
    this.task = JSON.parse(JSON.stringify(task));
    
    if (this.task.parent_id != undefined)
      this.goal = JSON.parse(JSON.stringify(all_goals[task.parent_id]));
    else
      this.goal = undefined;
    
    if (this.goal != undefined && this.goal.parent_id != undefined)
      this.vision = JSON.parse(JSON.stringify(all_visions[this.goal.parent_id]));
    else
      this.vision = undefined;
  }
}

export class ExpandedGoal extends Goal
{
    parent_vision: Vision;
    child_tasks: Task[];

    constructor(goal: Goal, all_tasks: Task[], all_visions: Vision[])
    {
        super();

        // Goal fields
        this.name = goal.name;
        this.date_created = goal.date_created;
        this.date_completed = goal.date_completed;
        this.date_cancelled = goal.date_cancelled;
        
        this.details = goal.details;
        this.unique_id = goal.unique_id;
        this.parent_id = goal.parent_id;
        this.child_ids = goal.child_ids.slice();

        // Expanded fields
        if (goal.parent_id != undefined)
            this.parent_vision = JSON.parse(JSON.stringify(all_visions[this.parent_id]));
        
        this.child_tasks = [];
        for (let child_id of goal.child_ids)
        {
            this.child_tasks.push(all_tasks[child_id]);
        }
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

    static get_expanded_tasks(task_ids: number[], database_manager: DatabaseManager)
    {
      let all_tasks = database_manager.get_tasks_ref();
      let all_goals = database_manager.get_goals_ref();
      let all_visions = database_manager.get_visions_ref();

      let expanded_tasks = [];
      
      for (let task_id of task_ids)
      {
        let task = all_tasks[task_id];
        let expanded_task = new ExpandedTask(task, all_goals, all_visions);
        expanded_tasks.push(expanded_task);
      }

      return expanded_tasks;
    }

    static get_expanded_goals(goal_ids: number[], database_manager: DatabaseManager)
    {
      let all_tasks = database_manager.get_tasks_ref();
      let all_goals = database_manager.get_goals_ref();
      let all_visions = database_manager.get_visions_ref();

      let expanded_goals = [];
      
      for (let goal_id of goal_ids)
      {
        let goal = all_goals[goal_id];
        
        let expanded_goal = new ExpandedGoal(goal, all_tasks, all_visions);

        expanded_goals.push(expanded_goal);
      }

      return expanded_goals;
    }

    static get_all_expanded_goals(database_manager: DatabaseManager)
    {
      let all_tasks = database_manager.get_tasks_ref();
      let all_goals = database_manager.get_goals_ref();
      let all_visions = database_manager.get_visions_ref();

      let expanded_goals = [];
      
      for (let goal of all_goals)
      {        
        let expanded_goal = new ExpandedGoal(goal, all_tasks, all_visions);

        expanded_goals.push(expanded_goal);
      }

      return expanded_goals;
    }
}