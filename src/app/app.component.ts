import { Component, OnDestroy } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AddressedTransfer } from './providers/addressed_transfer';
import { ManageSettings } from './tab_manage/components/settings/settings';
import { CalendarManager } from './providers/calendar_manager';
import { DatabaseManager } from './providers/database_manager';
import { get_gregorian } from './providers/discrete_date';

export class MenuEventHandlers
{
  on_page_select: (page_number: number) => void;
  on_settings_change: (settings: ManageSettings) => void;
  on_change_week: () => void;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy{
  page_number_;
  current_week_str_: string;
  manage_settings_: ManageSettings;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private addressed_transfer_: AddressedTransfer,
    private database_manager_: DatabaseManager,  // TODO: Such a hack
    private calendar_manager_: CalendarManager,
    private menu_controller_: MenuController,
  ) {
    this.initializeApp();
    this.page_number_ = 0;

    this.current_week_str_ = "";
    this.manage_settings_ = new ManageSettings();

    this.database_manager_.register_data_updated_callback("app_component", () => {
      // TODO(ABurroughs): Use pipe
      let active_week = this.calendar_manager_.get_active_week();
      let active_week_date = get_gregorian(active_week);
      let month_str = active_week_date.toLocaleString('default', { month: 'long' });
      let day = active_week_date.getDate();

      this.current_week_str_ = `Week ${active_week.week} (${month_str.slice(0, 3)} ${day})`;
    });
  }

  select_page(page_number: number)
  {
    this.page_number_ = page_number;
    let event_handlers = this.addressed_transfer_.get("menu_handlers");
    
    if (event_handlers)
    {
      event_handlers.on_page_select(page_number);
    }

    this.menu_controller_.close();
  }

  show_completed_change(event)
  {
    this.manage_settings_.show_completed = event.detail.checked;
    
    let event_handlers = this.addressed_transfer_.get("menu_handlers");
    if (event_handlers)
    {
      event_handlers.on_settings_change(this.manage_settings_);
    }
  }

  show_dormant_change(event)
  {
    this.manage_settings_.show_dormant = event.detail.checked;
    
    let event_handlers = this.addressed_transfer_.get("menu_handlers");
    if (event_handlers)
    {
      event_handlers.on_settings_change(this.manage_settings_);
    }
  }

  change_week()
  {
    let event_handlers = this.addressed_transfer_.get("menu_handlers");
    
    if (event_handlers)
    {
      event_handlers.on_change_week();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("app_component");
  }
}
