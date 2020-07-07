import { Component, OnInit } from '@angular/core';
import { get_this_week, get_gregorian, get_week } from 'src/app/providers/discrete_date';

class SelectableWeek
{
  monday_date: string;
  iso_week: string;
  current: boolean; // TODO
};

@Component({
  selector: 'app-change-week',
  templateUrl: './change-week.component.html',
  styleUrls: ['./change-week.component.scss'],
})
export class ChangeWeekComponent implements OnInit {
  private weeks_: SelectableWeek[];
  
  constructor() { 
    const kWeeksAhead = 12;
    const kWeeksBehind = 0;
    const kWeekInMs = 1000 * 60 * 60 * 24 * 7;

    this.weeks_ = [];

    let this_week = get_this_week();
    let this_week_date = get_gregorian(this_week);

    for (let i = -kWeeksBehind; i <= kWeeksAhead; i++)
    {
      let week_monday_date = new Date(this_week_date.getTime() + i * kWeekInMs);
      let iso_week = get_week(week_monday_date);

      console.log()

      // Format monday date string
      let monday_date_str = week_monday_date.toDateString();
      
      // Format ISO week string
      let offset_str = "Current";
      if (i < 0)
        offset_str = `${i}`;
      else if (i > 0)
        offset_str = `+${i}`;

      let iso_week_str = `W${iso_week.week}, ${iso_week.year} (${offset_str})`;

      this.weeks_.push({monday_date: monday_date_str, iso_week: iso_week_str, current: i == 0});
    }
  }

  ngOnInit() {}

}
