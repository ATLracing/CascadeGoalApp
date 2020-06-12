import { Injectable } from "@angular/core"

@Injectable()
export class CalendarManager
{
    static get_date()
    {
        return new Date();
    }
}