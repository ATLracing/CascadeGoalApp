import { Injectable } from "@angular/core"
import { DatabaseManager } from './database_manager';
import * as PackedRecord from './packed_record';

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

    static get_date()
    {
        return new Date();
    }

    static calendar_loop(database_manager: DatabaseManager)
    {
        let current_date = new Date();
        console.log("Calendar Loop" + current_date.toDateString);
        let all_days = database_manager.get_days();

        if (all_days.length == 0)
        {
            // New week, new day, no carry
            let new_week_id = database_manager.week_add(current_date, ["local"], true);

            let new_day_id = database_manager.day_add(current_date, ["local"], true);
            database_manager.day_add_to_week(new_day_id, new_week_id);  // Callback
        }
        else
        {
            let most_recent_day = database_manager.get_most_recent_day();

            let delta_ms = current_date.getTime() - most_recent_day.date.getTime();
            let delta_days = delta_ms / (1000 * 60 * 60 * 24);
            
            if (current_date.getDay() < most_recent_day.date.getDay() || delta_days > 7)
            {
                console.log("Adding day and week with carry")
                // New week, new day, carry
                let most_recent_week = database_manager.get_week(most_recent_day.week_id);
                console.log(most_recent_day.week_id);
                let new_week_id = CalendarManager.add_new_week_with_carry(most_recent_week, current_date, database_manager);
                let new_day_id = CalendarManager.add_new_day_with_carry(most_recent_day, current_date, database_manager);
                
                database_manager.day_add_to_week(new_day_id, new_week_id);  // Callback
            }
            else if (current_date.getDay() > most_recent_day.date.getDay())
            {
                console.log("Adding day with carry")
                // New day, carry
                let current_week = database_manager.get_week(most_recent_day.week_id);
                let new_day_id = CalendarManager.add_new_day_with_carry(most_recent_day, current_date, database_manager);

                database_manager.day_add_to_week(new_day_id, current_week.unique_id);   // Callback
            }
        }

        const CALENDAR_LOOP_PERIOD = 1000;
        setTimeout(() => {this.calendar_loop(database_manager)}, CALENDAR_LOOP_PERIOD);
    }

    private static add_new_day_with_carry(most_recent_day: PackedRecord.Day, 
                                          current_date: Date,
                                          database_manager: DatabaseManager): PackedRecord.DayID
    {
        let recent_incomplete_task_ids = [];

        for (let task_id of most_recent_day.task_ids)
        {
            let task = database_manager.get_task(task_id)
            
            if (task.date_completed == undefined)
            {
                // incomplete
                recent_incomplete_task_ids.push(task_id);
            }
        }

        let new_day_id = database_manager.day_add(current_date, ["local"], true);
        database_manager.day_set_task_ids(new_day_id, recent_incomplete_task_ids);
        
        return new_day_id;
    }

    private static add_new_week_with_carry(most_recent_week: PackedRecord.Week,
                                           current_date: Date,
                                           database_manager: DatabaseManager): PackedRecord.WeekID
    {
        let recent_incomplete_task_ids = [];

        for (let task_id of most_recent_week.task_ids)
        {
            let task = database_manager.get_task(task_id)
            
            if (task.date_completed == undefined)
            {
                // incomplete
                recent_incomplete_task_ids.push(task_id);
            }
        }

        let new_week_id = database_manager.week_add(current_date, ["local"], true);
        database_manager.week_set_task_ids(new_week_id, recent_incomplete_task_ids, true);

        return new_week_id;
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