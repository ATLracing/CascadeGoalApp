import { Component, OnInit } from '@angular/core';
import { get_this_week, get_gregorian, get_week, DiscreteDate, contains } from 'src/app/providers/discrete_date';
import { ModalController, NavParams } from '@ionic/angular';

class SelectableWeek
{
  monday_date_str: string;
  iso_week_str: string;
  current: boolean; // TODO
  active: boolean; // TODO

  iso_week: DiscreteDate;
};

@Component({
  selector: 'app-change-week',
  templateUrl: './change-week.component.html',
  styleUrls: ['./change-week.component.scss'],
})
export class ChangeWeekComponent implements OnInit {
  private weeks_: SelectableWeek[];
  
  constructor(private modal_controller_: ModalController, 
              nav_params_: NavParams) { 
    const kWeeksAhead = 12;
    const kWeeksBehind = 0;
    const kWeekInMs = 1000 * 60 * 60 * 24 * 7;

    this.weeks_ = [];

    let this_week = get_this_week();
    let this_week_date = get_gregorian(this_week);
    
    let active_week = nav_params_.get('active_discrete_date');

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

      let iso_week_str = `Week ${iso_week.week} (${offset_str})`;

      this.weeks_.push({monday_date_str: monday_date_str, iso_week_str: iso_week_str, current: i == 0, active: contains(active_week, iso_week), iso_week: iso_week});
    }
  }

  select_week(week_index)
  {
    let week = this.weeks_[week_index].iso_week;
    this.modal_controller_.dismiss(week);
  }

  ngOnInit() {}

}
