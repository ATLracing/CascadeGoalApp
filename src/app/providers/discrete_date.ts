// TODO(ABurroughs): Should switch to epoch days/weeks
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

// ISO 8601 week date system ======================================================================= 
function get_iso_day_of_week_from_date(date: Date) : number
{
    return (date.getDay() + 6) % 7;
}

function get_iso_week_from_date(date: Date) : number
{
    // Copy
    date = new Date(date);
    
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
function get_iso_week_year_from_date(date: Date) : number
{
    // Copy
    date = new Date(date);

    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
}

function get_iso_day_of_week() : number
{
    return this.get_iso_day_of_week_from_date(new Date());
}

function get_iso_week() : number 
{
    return get_iso_week_from_date(new Date());
}

function get_iso_week_year() :number
{
    return this.get_iso_week_year_from_date(new Date());
}

function is_leap_year(year)
{
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

// Interface ======================================================================================= 
export function get_day(date: Date) : DiscreteDate
{
    return { day: get_iso_day_of_week_from_date(date), week: get_iso_week_from_date(date), year: get_iso_week_year_from_date(date) };
}

export function get_week(date: Date) : DiscreteDate
{
    return { day: null, week: get_iso_week_from_date(date), year: get_iso_week_year_from_date(date) };
}

export function get_today() : DiscreteDate
{
    return get_day(new Date());
}

export function get_this_week() : DiscreteDate
{
    return get_week(new Date());
}

export function get_null_date(): DiscreteDate
{
    return {day: null, week: null, year: null};
}

export function equals(date_one: DiscreteDate, date_two: DiscreteDate) : boolean
{
    return date_one.day  == date_two.day && 
           date_one.week == date_two.week &&
           date_one.year == date_two.year;
}

export function contains(containee: DiscreteDate, container: DiscreteDate)
{
    // TODO(ABurroughs): assert(spec != undefined)
    if (!containee)
        return false

    if (container.year != null && containee.year != container.year)
    {
        return false;
    }
    if (container.week != null && containee.week != container.week)
    {
        return false;
    }
    if (container.day != null && containee.day != container.day)
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

    if (spec.year != null && date.year != spec.year)
    {
        if (date.year == null)
            return false;
        
        return date.year < spec.year;
    }
    if (spec.week != null && date.week != spec.week)
    {
        if (date.week == null)
            return false;

        return date.week < spec.week;
    }
    if (spec.day != null)
    {
        if (date.day == null)
            return false;

        return date.day < spec.day;
    }

    return false;
}

export function get_level(date: DiscreteDate)
{
    if (date.day != null)
        return DiscreteDateLevel.DAY;
    if (date.week != null)
        return DiscreteDateLevel.WEEK;
    if (date.year != null)
        return DiscreteDateLevel.YEAR;

    return DiscreteDateLevel.NULL;
}

// Return gregorian JS date object
// https://en.wikipedia.org/wiki/ISO_week_date#Algorithms
export function get_gregorian(date: DiscreteDate) : Date
{
    let january_fourth = new Date(date.year, 0, 4);

    let ordinal_day = date.week * 7 + date.day - (get_iso_day_of_week_from_date(january_fourth) + 3);
    let year = date.year;

    if (ordinal_day < 1)
    {
        ordinal_day += is_leap_year(year - 1) ? 366 : 365;
        year -= 1;
    }
    else if (ordinal_day > (is_leap_year(year) ? 366 : 365))
    {
        ordinal_day -= is_leap_year(year) ? 366 : 365;
        year += 1;
    }

    let jan_first = new Date(year, 0, 1);  // Jan 1, year
    let date_ms = jan_first.getTime() + (ordinal_day - 1) * 24 * 60 * 60 * 1000;

    return new Date(date_ms);
}