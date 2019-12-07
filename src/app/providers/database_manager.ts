import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { example_db_image } from 'src/app/providers/example_db';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as Util from 'src/app/providers/util';
import { CMap } from 'src/app/providers/custom_id_map';

/* --------------------------------------- Brief design note ---------------------------------------
 * The database manager is designed to maintain coherent representations of the task/goal/vision
 * and day/week graphs (although these graphs have little in common..). It will construct these 
 * representations from and return modifications to the underlying/remote databases. The tree 
 * structures at this layer are designed to be efficient and information complete; they are not 
 * designed to be user-friendly or UI-bindable. Legal graph modifications are restricted to and 
 * abstracted by the methods at this layer's interface. Redundancy abounds.. for now.
 */

// Used for development. Will be replaced by SQL driver.
export class DatabaseImage
{
    version: number;

    tasks: PackedRecord.Task[];
    goals: PackedRecord.Goal[];
    visions: PackedRecord.Vision[];

    days: PackedRecord.Day[];
    weeks: PackedRecord.Week[];

    most_recent_day_id: PackedRecord.DayID;
    most_recent_week_id: PackedRecord.WeekID;
    next_available_index: number;  // IDs will be globally unique. Should help catch errors.
}

// Used for development. May be used in release.
class LoadedDatabaseImage
{
    version: number;
    next_available_index: number;

    tasks: CMap<PackedRecord.TaskID, PackedRecord.Task>;
    goals: CMap<PackedRecord.GoalID, PackedRecord.Goal>;
    visions: CMap<PackedRecord.VisionID, PackedRecord.Vision>;

    days: CMap<PackedRecord.DayID, PackedRecord.Day>;
    weeks: CMap<PackedRecord.WeekID, PackedRecord.Week>;

    most_recent_day_id: PackedRecord.DayID;
    most_recent_week_id: PackedRecord.WeekID;

    constructor(database_image: DatabaseImage)
    {
        this.version = database_image.version;
        this.next_available_index = database_image.next_available_index;
        this.most_recent_day_id = database_image.most_recent_day_id;
        this.most_recent_week_id = database_image.most_recent_week_id;

        this.tasks = new CMap<PackedRecord.TaskID, PackedRecord.Task>();
        this.goals = new CMap<PackedRecord.GoalID, PackedRecord.Goal>();
        this.visions = new CMap<PackedRecord.VisionID, PackedRecord.Vision>();
        this.days = new CMap<PackedRecord.DayID, PackedRecord.Day>();
        this.weeks = new CMap<PackedRecord.WeekID, PackedRecord.Week>();

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
            next_available_index: this.next_available_index,
            tasks: Array.from(this.tasks.values()),
            goals: Array.from(this.goals.values()),
            visions: Array.from(this.visions.values()),
            days: Array.from(this.days.values()),
            weeks: Array.from(this.weeks.values()),
            most_recent_day_id: this.most_recent_day_id,
            most_recent_week_id: this.most_recent_week_id
        };

        return image;
    }
}

let empty_db : DatabaseImage = {
    version: 1,
    
    tasks: [],
    goals: [],
    visions: [],

    days: [],
    weeks: [],

    most_recent_day_id: { type: PackedRecord.Type.DAY, index: 0, group: ["local"] },
    most_recent_week_id: { type: PackedRecord.Type.DAY, index: 0, group: ["local"] },
    next_available_index: 0
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
        const KEY_DATABASE_IMAGE = "key_database_image";
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

    // ========================================================================================= GET
    // TODO(ABurroughs): These methods should eventually accept filters (to improve performance)
    get_task(unique_id: PackedRecord.TaskID): PackedRecord.Task
    {
        return PackedRecord.Task.copy(DatabaseManager.database_data.tasks.get(unique_id));
    }
    get_goal(unique_id: PackedRecord.GoalID): PackedRecord.Goal
    {
        return PackedRecord.Goal.copy(DatabaseManager.database_data.goals.get(unique_id));
    }
    get_vision(unique_id: PackedRecord.VisionID): PackedRecord.Vision
    {
        return PackedRecord.Vision.copy(DatabaseManager.database_data.visions.get(unique_id));
    }
    get_day(unique_id: PackedRecord.DayID): PackedRecord.Day
    {
        return PackedRecord.Day.copy(DatabaseManager.database_data.days.get(unique_id));
    }
    get_week(unique_id: PackedRecord.WeekID): PackedRecord.Week
    {
        return PackedRecord.Week.copy(DatabaseManager.database_data.weeks.get(unique_id));
    }
    get_tasks(): PackedRecord.Task[]
    {
        // TODO: copy
        return Array.from(DatabaseManager.database_data.tasks.values());
    }
    get_goals(): PackedRecord.Goal[]
    {
        // TODO: copy
        return Array.from(DatabaseManager.database_data.goals.values());
    }
    get_visions(): PackedRecord.Vision[]
    {
        // TODO: copy
        return Array.from(DatabaseManager.database_data.visions.values());
    }
    get_days(): PackedRecord.Day[]
    {
        // TODO: copy
        return Array.from(DatabaseManager.database_data.days.values());
    }
    get_weeks(): PackedRecord.Week[]
    {
        // TODO: copy
        return Array.from(DatabaseManager.database_data.weeks.values());
    }
    get_most_recent_day(): PackedRecord.Day
    {
        return PackedRecord.Day.copy(DatabaseManager.database_data.days.get(DatabaseManager.database_data.most_recent_day_id));
    }
    get_most_recent_week(): PackedRecord.Week
    {
        return PackedRecord.Week.copy(DatabaseManager.database_data.weeks.get(this.get_most_recent_day().week_id));
    }

    // ======================================================================================== TASK
    task_add(name: string,
             details: string, 
             date_created: Date,
             date_completed: Date,
             group: string[],
             no_callbacks?: boolean) : PackedRecord.TaskID
    {        
        // Generate a unique ID
        let new_unique_id = new PackedRecord.TaskID(DatabaseManager.database_data.next_available_index++, group);
        
        // Add to the database
        let new_task = new PackedRecord.Task(name, details, date_created, date_completed, PackedRecord.NullID, new_unique_id);
        DatabaseManager.database_data.tasks.set(new_unique_id, new_task);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        // Return the new ID
        return new_unique_id;
    }

    task_remove(unique_id: PackedRecord.TaskID,
                no_callbacks?: boolean)
    {
        // Fetch task from database
        let task = DatabaseManager.database_data.tasks.get(unique_id);
        
        // Remove from parent
        if (task.parent_id)
        {
            let parent_goal = DatabaseManager.database_data.goals.get(task.parent_id);
            parent_goal.child_ids = Util.remove_element_from_array(unique_id, parent_goal.child_ids);
        }

        // Remove task
        DatabaseManager.database_data.tasks.delete(unique_id);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    task_set_basic_attributes(unique_id: PackedRecord.TaskID,
                              name: string,
                              details: string, 
                              date_created: Date,
                              date_completed: Date,
                              no_callbacks?: boolean)
    {
        // Fetch task from database
        let task = DatabaseManager.database_data.tasks.get(unique_id);

        // Update properties
        task.name = name;
        task.details = details;
        task.date_created = date_created;
        task.date_completed = date_completed;

        // Write back to database (redundant atm)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    task_toggle_completion(unique_id: PackedRecord.TaskID, 
                           no_callbacks?: boolean)
    {
        // Query database for task
        let task = DatabaseManager.database_data.tasks.get(unique_id);

        // TODO: This doesn't belong here
        if (task.date_completed == PackedRecord.DateIncomplete)
            task.date_completed = new Date();
        else
            task.date_completed = PackedRecord.DateIncomplete;
            
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    task_set_parent(unique_id: PackedRecord.ID,
                    parent_id: PackedRecord.ID,
                    no_callbacks?: boolean)
    {
        // Fetch task from database
        let task = DatabaseManager.database_data.tasks.get(unique_id);

        // If the parent_id is already set, remove this task_id from the current parent
        if (task.parent_id != PackedRecord.NullID)
        {
            let parent = undefined;

            if (unique_id.type == PackedRecord.Type.GOAL)
            {
                // Fetch parent goal from database
                let parent = DatabaseManager.database_data.goals.get(task.parent_id);
            }
            else if (unique_id.type == PackedRecord.Type.VISION)
            {
                let parent = DatabaseManager.database_data.visions.get(task.parent_id);
            }

            // Remove the current task_id
            parent.child_ids = Util.remove_element_from_array(unique_id, parent.child_ids);

            // Write back to database (redundant atm)
        }

        // Set the new goal id
        task.parent_id = parent_id;

        // Add this task_id to the new parent
        let parent = undefined;
        
        if (parent_id.type == PackedRecord.Type.GOAL)
            parent = DatabaseManager.database_data.goals.get(task.parent_id);
        else if (parent_id.type == PackedRecord.Type.VISION)
            parent = DatabaseManager.database_data.visions.get(task.parent_id);
        
        parent.child_ids.push(unique_id);

        // Write back to database (redundant atm)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    // ======================================================================================== GOAL
    goal_add(name: string,
             details: string, 
             date_created: Date,
             date_completed: Date,
             group: string[],
             no_callbacks?: boolean) : PackedRecord.GoalID
    {
        // Generate a unique ID
        let new_unique_id = new PackedRecord.GoalID(DatabaseManager.database_data.next_available_index++, group);
        
        // Add to the database
        let new_task = new PackedRecord.Goal(name, details, date_created, date_completed, PackedRecord.NullID, undefined /* TODO */, new_unique_id);
        DatabaseManager.database_data.goals.set(new_unique_id, new_task);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        // Return the new ID
        return new_unique_id;
    }

    goal_remove(unique_id: PackedRecord.GoalID,
                no_callbacks?: boolean)
    {
        // Fetch task from database
        let goal = DatabaseManager.database_data.goals.get(unique_id);

        // Remove from parent
        if (goal.parent_id)
        {
            let parent_vision = DatabaseManager.database_data.visions.get(goal.parent_id);
            parent_vision.child_ids = Util.remove_element_from_array(unique_id, parent_vision.child_ids);
        }

        // Remove as parent from children
        for (let task_id of goal.child_ids)
        {
            let task = DatabaseManager.database_data.tasks.get(task_id);
            task.parent_id = PackedRecord.NullID;
        }

        // Remove goal
        DatabaseManager.database_data.goals.delete(unique_id);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    goal_set_basic_attributes(unique_id: PackedRecord.GoalID,
                              name: string,
                              details: string, 
                              date_created: Date,
                              date_completed: Date,
                              no_callbacks?: boolean)
    {
        // Fetch goal from database
        let goal = DatabaseManager.database_data.goals.get(unique_id);

        // Update properties
        goal.name = name;
        goal.details = details;
        goal.date_created = date_created;
        goal.date_completed = date_completed;

        // Write back to database (redundant atm)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    goal_set_parent(unique_id: PackedRecord.VisionID,
                    parent_id: PackedRecord.VisionID,
                    no_callbacks?: boolean)
    {
        // Fetch goal from database
        let goal = DatabaseManager.database_data.goals.get(unique_id);

        // If the parent_id is already set, remove this task_id from the current parent vision
        if (goal.parent_id)
        {
            let parent_vision = DatabaseManager.database_data.visions.get(goal.parent_id);

            // Remove the current task_id
            parent_vision.child_ids = Util.remove_element_from_array(unique_id, parent_vision.child_ids);

            // Write back to database (redundant atm)
        }

        // Set the new vision id
        goal.parent_id = parent_id;

        // Add this task_id to the new parent
        let parent_vision = DatabaseManager.database_data.visions.get(goal.parent_id);
        
        parent_vision.child_ids.push(unique_id);

        // Write back to database (redundant atm)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    goal_set_child_ids(unique_id: PackedRecord.GoalID,
                       child_ids: PackedRecord.TaskID[],
                       no_callbacks?: boolean)
    {
        // Fetch goal from database
        let goal = DatabaseManager.database_data.goals.get(unique_id);

        // Remove as parent from orphaned child tasks
        let new_child_ids_set = new Set<PackedRecord.TaskID>(child_ids);

        for (let existing_child_id of goal.child_ids)
        {
            if (!new_child_ids_set.has(existing_child_id))
            {
                let removed_task = DatabaseManager.database_data.tasks.get(existing_child_id);
                removed_task.parent_id = PackedRecord.NullID;
            }
        }

        // Add as parent for newly adopted child tasks
        let existing_child_ids_set = new Set<PackedRecord.TaskID>(goal.child_ids);
        
        for (let new_child_id of child_ids)
        {
            if (!existing_child_ids_set.has(new_child_id))
            {
                let added_task = DatabaseManager.database_data.tasks.get(new_child_id);
                added_task.parent_id = unique_id;
            }
        }

        // Set the child ids
        goal.child_ids = child_ids.slice();

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    // ===================================================================================== VISIONS
    vision_add(name: string,
               details: string, 
               date_created: Date,
               date_completed: Date,
               group: string[],
               no_callbacks?: boolean) : PackedRecord.VisionID
    {
        // Generate a unique ID
        let new_unique_id = new PackedRecord.VisionID(DatabaseManager.database_data.next_available_index++, group);
        
        // Add to the database
        let new_vision = new PackedRecord.Vision(name, details, date_created, date_completed, PackedRecord.NullID, new_unique_id);
        DatabaseManager.database_data.visions.set(new_unique_id, new_vision);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        // Return the new ID
        return new_unique_id;
    }

    vision_remove(unique_id: PackedRecord.VisionID,
                  no_callbacks?: boolean)
    {
        // Fetch task from database
        let vision = DatabaseManager.database_data.visions.get(unique_id);

        // Remove as parent from children
        for (let goal_id of vision.child_ids)
        {
            let goal = DatabaseManager.database_data.goals.get(goal_id);
            goal.parent_id = PackedRecord.NullID;
        }

        // Remove goal
        DatabaseManager.database_data.visions.delete(unique_id);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }
    
    visions_set_basic_attributes(unique_id: PackedRecord.VisionID,
                                 name: string,
                                 details: string, 
                                 date_created: Date,
                                 date_completed: Date,
                                 no_callbacks?: boolean)
    {
        // Fetch goal from database
        let vision = DatabaseManager.database_data.visions.get(unique_id);

        // Update properties
        vision.name = name;
        vision.details = details;
        vision.date_created = date_created;
        vision.date_completed = date_completed;

        // Write back to database (redundant atm)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    vision_set_child_ids(unique_id: PackedRecord.VisionID,
                         child_ids: PackedRecord.GoalID[],
                         no_callbacks?: boolean)
    {
        // Fetch goal from database
        let vision = DatabaseManager.database_data.visions.get(unique_id);

        // Remove as parent from orphaned child goals
        let new_child_ids_set = new Set<PackedRecord.VisionID>(child_ids);

        for (let existing_child_id of vision.child_ids)
        {
            if (!new_child_ids_set.has(existing_child_id))
            {
                let removed_goal = DatabaseManager.database_data.goals.get(existing_child_id);
                removed_goal.parent_id = PackedRecord.NullID;
            }
        }

        // Add as parent for newly adopted child goals
        let existing_child_ids_set = new Set<PackedRecord.GoalID>(vision.child_ids);

        for (let new_child_id of child_ids)
        {
            if (!existing_child_ids_set.has(new_child_id))
            {
                let added_goal = DatabaseManager.database_data.goals.get(new_child_id);
                added_goal.parent_id = unique_id;
            }
        }

        // Set the child ids
        vision.child_ids = child_ids.slice();

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    // ========================================================================================= DAY
    day_add(date: Date, 
            group: string[],
            no_callbacks?: boolean) : PackedRecord.DayID
    {
        // Generate a unique ID
        let new_unique_id = new PackedRecord.DayID(DatabaseManager.database_data.next_available_index++, group);

        // Link to previous day
        let previous_id = DatabaseManager.database_data.most_recent_day_id;

        // Update most recent day
        DatabaseManager.database_data.most_recent_day_id = new_unique_id;
        
        // Add day
        let new_day = new PackedRecord.Day(date, undefined /* TODO */, previous_id, PackedRecord.NullID, new_unique_id);
        DatabaseManager.database_data.days.set(new_unique_id, new_day);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return new_unique_id;
    }

    day_add_to_week(unique_id: PackedRecord.DayID,
                    unique_week_id: PackedRecord.WeekID,
                    no_callbacks?: boolean)
    {
        // Query for week
        let week = DatabaseManager.database_data.weeks.get(unique_week_id);

        // Add day to week            
        if (week.day_ids == undefined)
            week.day_ids = [];
            
        week.day_ids.push(unique_id);

        // Write back to database (currently redundant)
        
        // Query for day
        let day = DatabaseManager.database_data.days.get(unique_id);

        day.week_id = unique_week_id;

        // Write back to database (currently redundant)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    day_set_task_ids(unique_id: PackedRecord.DayID,
                     task_ids: PackedRecord.TaskID[],
                     no_callbacks?: boolean)
    {
        // Query for day
        let day = DatabaseManager.database_data.days.get(unique_id);

        day.task_ids = task_ids.slice();

        // Write back to database (currently redundant)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    // ======================================================================================== WEEK
    week_add(date: Date, 
             group: string[],
             no_callbacks?: boolean) : PackedRecord.WeekID
    {
        // Generate a unique ID
        let new_unique_id = new PackedRecord.WeekID(DatabaseManager.database_data.next_available_index++, group);

        // Link to previous week
        let previous_id = DatabaseManager.database_data.most_recent_day_id;

        // Update most recent week
        DatabaseManager.database_data.most_recent_week_id = new_unique_id;
        
        // Add week
        let new_week = new PackedRecord.Week(date, undefined /* TODO */, undefined /* TODO */, previous_id, new_unique_id);
        DatabaseManager.database_data.weeks.set(new_unique_id, new_week);

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);

        return new_unique_id;
    }

    week_set_task_ids(unique_id: PackedRecord.WeekID,
                      task_ids: PackedRecord.TaskID[],
                      no_callbacks?: boolean)
    {
        // Query for week
        let week = DatabaseManager.database_data.weeks.get(unique_id);

        week.task_ids = task_ids.slice();

        // Write back to database (currently redundant)

        // Callbacks
        DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    }

    // ====================================================================================== LEGACY

    // add_task_to_day(day_id: number, task_id: number, no_callbacks?: boolean)
    // {
    //     DatabaseManager.database_data.days.get(day_id).task_ids.push(task_id);
    //     DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    // }

    // add_tasks_to_day(day_id: number, task_ids: number[], no_callbacks?: boolean)
    // {
    //     DatabaseManager.database_data.days.get(day_id).task_ids =
    //         DatabaseManager.database_data.days.get(day_id).task_ids.concat(task_ids);
    //     DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    // }

    // remove_task_from_day(day_id: number, remove_task_id: number, no_callbacks?: boolean)
    // {
    //     let day_task_ids = DatabaseManager.database_data.days.get(day_id).task_ids;

    //     let remove_index = day_task_ids.findIndex((task_id) => { return task_id == remove_task_id });
    //     day_task_ids.splice(remove_index, 1);
    //     DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    // }

    // add_task_to_week(week_id: number, task_id: number, no_callbacks?: boolean)
    // {
    //     DatabaseManager.database_data.weeks.get(week_id).task_ids.push(task_id);
    //     DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    // }

    // add_tasks_to_week(week_id: number, task_ids: number[], no_callbacks?: boolean)
    // {
    //     DatabaseManager.database_data.weeks.get(week_id).task_ids = 
    //         DatabaseManager.database_data.weeks.get(week_id).task_ids.concat(task_ids);
    //     DatabaseManager.execute_data_updated_callbacks(no_callbacks);
    // }

    // remove_task_from_week(week_id: number, day_id: number, remove_task_id: number, no_callbacks?: boolean)
    // {
    //     // Remove from week
    //     let week_task_ids = DatabaseManager.database_data.weeks.get(week_id).task_ids;

    //     let remove_index = week_task_ids.findIndex((task_id) => { return task_id == remove_task_id });
    //     week_task_ids.splice(remove_index, 1);
        
    //     // Remove from day
    //     this.remove_task_from_day(day_id, remove_task_id);
    // }
}