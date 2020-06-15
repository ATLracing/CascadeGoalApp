export class DiscreteDate
{
    day: number;
    week: number;
    year: number;
};

export enum DiscreteDateLevel
{
    DAY,
    WEEK,
    YEAR,
    NULL
}

// Returns the ISO week of the date.
function get_iso_week() : number 
{
    return get_iso_week_from_date(new Date());
}

function get_iso_week_from_date(date: Date) : number
{
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
function get_iso_week_year() :number
{
    return this.get_iso_week_year_from_date(new Date());
}

function get_iso_week_year_from_date(date: Date) : number
{
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
}


function get_day_of_week() : number
{
    return this.get_day_of_week_from_date(new Date());
}

function get_day_of_week_from_date(date: Date) : number
{
    let day_number = date.getDay() - 1;

    if (day_number < 0) // TODO: Because mod with negative numbers never works the way you want it to..
        day_number += 7;

    return day_number;
}

export function get_day(day: number, week: number, year: number) : DiscreteDate
{
    return {day: day, week: week, year: year};
}

export function get_week(week: number, year: number) : DiscreteDate
{
    return {day: null, week: week, year: year};
}

export function get_today() : DiscreteDate
{
    let date = new Date();
    return { day: get_day_of_week_from_date(date), week: get_iso_week_from_date(date), year: get_iso_week_year_from_date(date) };
}

export function get_this_week() : DiscreteDate
{
    let date = new Date();
    return { day: null, week: get_iso_week_from_date(date), year: get_iso_week_year_from_date(date) };
}

export function get_null_date(): DiscreteDate
{
    return {day: null, week: null, year: null};
}

export function contains(containee: DiscreteDate, container: DiscreteDate)
{
    // TODO(ABurroughs): assert(spec != undefined)
    if (!containee)
        return false

    if (container.year && containee.year != container.year)
    {
        return false;
    }
    if (container.week && containee.week != container.week)
    {
        return false;
    }
    if (container.day && containee.day != container.day)
    {
        return false;
    }

    return true;
}

export function prior_to(date: DiscreteDate, spec: DiscreteDate)
{
    // TODO(ABurroughs): assert(spec != undefined)
    if (!date)
        return false

    if (spec.year && date.year != spec.year)
    {
        if (!date.year)
            return false;
        
        return date.year < spec.year;
    }
    if (spec.week && date.week != spec.week)
    {
        if (!date.week)
            return false;

        return date.week < spec.week;
    }
    if (spec.day)
    {
        if (!date.day)
            return false;

        return date.day < spec.day;
    }

    return false;
}

export function get_level(date: DiscreteDate)
{
    if (date.day)
        return DiscreteDateLevel.DAY;
    if (date.week)
        return DiscreteDateLevel.WEEK;
    if (date.year)
        return DiscreteDateLevel.YEAR;

    return DiscreteDateLevel.NULL;
}