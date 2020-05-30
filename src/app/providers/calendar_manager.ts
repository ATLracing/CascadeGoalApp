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

    // Returns the ISO week of the date.
    static get_iso_week() : number 
    {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                                - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    // Returns the four-digit year corresponding to the ISO week of the date.
    static get_iso_week_year() :number
    {
        var date = new Date();
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        return date.getFullYear();
    }

    static get_day_of_week() : number
    {
        return new Date().getDay(); // TODO
    }

    static async calendar_loop(database_manager: DatabaseManager)
    {
        // TODO..
    }
}