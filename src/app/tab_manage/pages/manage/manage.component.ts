import { Component, OnInit } from '@angular/core';
import { ManageSettings, SettingsComponent } from '../../components/settings/settings';
import { ModalController } from '@ionic/angular';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { MenuEventHandlers } from 'src/app/app.component';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ChangeWeekComponent } from 'src/app/tab_day/components/change-week/change-week.component';

enum ManageChildPage
{
  VISIONS = 0,
  BACKLOG
}

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManagePage implements OnInit {
  // Page select
  private current_page_;

  // Visions
  private toolbar_title_: string;
  private toolbar_display_buttons_: boolean;
  private send_to_week_mode_: boolean;
  private send_to_week_color_string_: string;
  private settings_: ManageSettings;
  private current_vision_: InflatedRecord.Vision;

  // Backlog

  constructor(private database_manager_: DatabaseManager,
              private calendar_manager_: CalendarManager,
              private modal_controller_: ModalController,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute) 
  {
    let menu_handlers : MenuEventHandlers =
    {
      on_page_select: (page_number) => {
        this.current_page_ = page_number;
      },
      on_settings_change : (settings) => {
        this.settings_ = settings;
      },
      on_change_week : () => {
        this.open_change_week();
      }
    };

    // Page select
    this.addressed_transfer_.put("menu_handlers", menu_handlers);

    this.current_page_ = ManageChildPage.VISIONS;

    // Visions
    this.toolbar_title_ = "";
    this.toolbar_display_buttons_ = false;
    this.send_to_week_mode_ = false;
    this.send_to_week_color_string_ = "black";
    this.settings_ = { show_completed: false };
    this.current_vision_ = undefined;

    // Backlog
  }

  toggle_send_to_week_mode()
  {
    this.send_to_week_mode_ = !this.send_to_week_mode_;
    this.send_to_week_color_string_ = this.send_to_week_color_string_ === "black" ? "primary" : "black";
  }

  edit_vision()
  {
    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: this.current_vision_,
        
        // Display elements
        title: "Edit Vision",
        enable_associate: false,
        enable_completion_status: false,
        enable_week_select: false,

        // Callbacks
        save_callback: (vision: InflatedRecord.TgvNode) => { this.database_manager_.tgv_set_basic_attributes(vision); },
        delete_callback: (vision: InflatedRecord.TgvNode) => { this.database_manager_.tgv_remove(vision); }
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  // async open_settings()
  // {
  //   const modal = await this.modal_controller_.create({component: SettingsComponent, componentProps: {settings: this.settings_} });
    
  //   modal.onDidDismiss().then(async settings => {
  //     this.settings_ = settings.data;
  //   });

  //   return await modal.present();
  // }

  async open_change_week()
  {
    const modal = await this.modal_controller_.create({component: ChangeWeekComponent, componentProps: {active_discrete_date: this.calendar_manager_.get_active_week() } });
  
    modal.onDidDismiss().then(async selected_week => {
      if (selected_week.data)
        this.calendar_manager_.set_active_week(selected_week.data);
    });

    return await modal.present();
  }

  vision_changed(event: InflatedRecord.Vision)
  {
    this.current_vision_ = event;

    if (this.current_vision_ != undefined)
    {
      this.toolbar_title_ = this.current_vision_.name;
      this.toolbar_display_buttons_ = true;
    }
    else
    {
      this.toolbar_title_ = ""
      this.toolbar_display_buttons_ = false;
    }
  }

  add_task_backlog()
  {
    let new_task = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_task,
        
        // Display elements
        title: "New Task",
        enable_associate: true,
        enable_completion_status: false,
        enable_week_select: true,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  
  add_goal_backlog()
  {
    let new_goal = InflatedRecord.construct_empty_node(InflatedRecord.Type.GOAL);

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_goal,
        
        // Display elements
        title: "New Goal",
        enable_associate: true,
        enable_completion_status: false,
        enable_week_select: false,

        // Callbacks
        save_callback: (new_goal: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_goal); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  ngOnInit() {}
}
