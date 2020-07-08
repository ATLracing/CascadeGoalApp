import { Component, OnDestroy } from '@angular/core';
import { CalendarManager } from '../providers/calendar_manager';
import { DatabaseManager, ParentFilter } from '../providers/database_manager';
import { get_this_week, equals } from '../providers/discrete_date';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnDestroy {
  private today_disabled_: boolean;
  private week_text_: string;
  
  constructor(private database_manager_: DatabaseManager,
              private calendar_manager_: CalendarManager) 
  {
    this.today_disabled_ = false;
    this.week_text_ = "This Week";
    this.database_manager_.register_data_updated_callback("tabs_page", () => {
      let current_week_active = equals(calendar_manager_.get_active_week(), get_this_week());
      this.today_disabled_ = !current_week_active;

      if (current_week_active)
      {
        this.week_text_ = "This Week";
      }
      else
      {
        this.week_text_ = `Week ${calendar_manager_.get_active_week().week}`;
      }
    });
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("tabs_page");
  }
}