import { Component } from '@angular/core';

import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AddressedTransfer } from './providers/addressed_transfer';
import { ManageSettings } from './tab_manage/components/settings/settings';

export class MenuEventHandlers
{
  on_page_select: (page_number: number) => void;
  on_settings_change: (settings: ManageSettings) => void;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  page_number_;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private addressed_transfer_: AddressedTransfer,
    private menu_controller_: MenuController
  ) {
    this.initializeApp();
    this.page_number_ = 0;
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
    let show_completed = event.detail.checked;
    let event_handlers = this.addressed_transfer_.get("menu_handlers");
    
    if (event_handlers)
    {
      let settings : ManageSettings = { show_completed: show_completed };
      event_handlers.on_settings_change(settings);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
    });
  }
}
