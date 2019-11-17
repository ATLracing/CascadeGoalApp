import { Injectable } from "@angular/core"
import { DatabaseManager, DatabaseImageDelegate, Day, Week, DatabaseHelper } from './database_manager';

@Injectable()
export class CalendarManager
{
    private static calendar_event_callbacks: Map<string, any>;
    private static initialized: boolean;

    constructor(private storage_: Storage)
    {
        if (!CalendarManager.initialized)
        {
            CalendarManager.initialized = true;
            CalendarManager.calendar_event_callbacks = new Map<string, any>();
        }
    }

    static calendar_loop(database_manager_: DatabaseManager)
    {
        console.log("Loop");
        console.log(database_manager_);
        let database_image = database_manager_.get_image_delegate();
        let all_days = database_image.get_days();

        if (all_days.length == 0)
        {
            // TODO Add day/week
            let new_week = DatabaseHelper.create_blank_week();
            let new_week_id = database_manager_.add_week(new_week, true);

            let new_day = DatabaseHelper.create_blank_day();
            new_day.parent_id = new_week_id;

            database_manager_.add_day(new_day);
        }
        else
        {
            let current_date = new Date();
            let most_recent_day = database_image.get_most_recent_day();

            let delta_ms = current_date.getTime() - most_recent_day.date.getTime();
            let delta_days = delta_ms / (1000 * 60 * 60 * 24);
            if (current_date.getDay() < most_recent_day.date.getDay() || delta_days > 7)
            {
                console.log("Adding day and week with carry")
                // TODO Add day/week with carry
                let most_recent_week = database_image.get_week(most_recent_day.parent_id);
                let new_week = CalendarManager.create_new_week(most_recent_week, database_image);

                let new_week_id = database_manager_.add_week(new_week, true);

                let new_day = CalendarManager.create_new_day(most_recent_day, new_week_id, database_image);

                database_manager_.add_day(new_day);

            }
            else if (current_date.getDay() > most_recent_day.date.getDay())
            {
                console.log("Adding day with carry")
                // Add day to week with carry
                let current_week = database_image.get_week(most_recent_day.parent_id);
                let new_day = CalendarManager.create_new_day(most_recent_day, current_week.unique_id, database_image);

                // Add day
                database_manager_.add_day(new_day);
            }
        }

        const CALENDAR_LOOP_PERIOD = 1000;
        setTimeout(() => {this.calendar_loop(database_manager_)}, CALENDAR_LOOP_PERIOD);
    }

    private static create_new_day(most_recent_day: Day, current_week_id: number, database_image: DatabaseImageDelegate)
    {
        let recent_incomplete_task_ids = [];

        for (let task_id of most_recent_day.task_ids)
        {
            let task = database_image.get_task(task_id)
            
            if (task.date_completed == undefined)
            {
                // incomplete
                recent_incomplete_task_ids.push(task_id);
            }
        }

        let new_day = DatabaseHelper.create_blank_day();
        
        new_day.task_ids = recent_incomplete_task_ids;
        new_day.parent_id = current_week_id;

        return new_day;
    }

    private static create_new_week(most_recent_week: Week, database_image: DatabaseImageDelegate)
    {
        let recent_incomplete_task_ids = [];

        for (let task_id of most_recent_week.task_ids)
        {
            let task = database_image.get_task(task_id)
            
            if (task.date_completed == undefined)
            {
                // incomplete
                recent_incomplete_task_ids.push(task_id);
            }
        }

        let new_week: Week = DatabaseHelper.create_blank_week();
        new_week.task_ids = recent_incomplete_task_ids;

        return new_week;
    }

    private static execute_data_updated_callbacks(no_callbacks?: boolean)
    {
        if (no_callbacks)
            return;
        
        // The compiler wants an array here. Not sure why.
        let callback_array = Array.from(CalendarManager.calendar_event_callbacks.values());
        for (let callback of callback_array)
        {
            callback();
        }
    }

    register_calendar_event_callbacks(name: string, callback_function: any)
    {
        CalendarManager.calendar_event_callbacks.set(name, callback_function);
        callback_function();
    }

    unregister_calendar_event_callbacks(name: string)
    {
        CalendarManager.calendar_event_callbacks.delete(name);
    }
}