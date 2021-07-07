import { Injectable } from "@angular/core"
import { DiscreteDate, get_this_week } from './discrete-date';
import { DatabaseManager } from './database-manager';

@Injectable()
export class CalendarManager
{
    static active_week_: DiscreteDate;
    static initialized_: boolean;

    constructor(private database_manager_: DatabaseManager)
    {
        if (!CalendarManager.initialized_)
        {
            CalendarManager.active_week_ = get_this_week();
            CalendarManager.initialized_ = true;
        }
    }

    get_active_week(): DiscreteDate
    {
        return CalendarManager.active_week_;
    }

    set_active_week(week: DiscreteDate)
    {
        CalendarManager.active_week_ = week;
        this.database_manager_.manually_trigger_callbacks();
    }
}