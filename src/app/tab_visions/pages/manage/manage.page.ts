import { Component, ViewChild } from '@angular/core';
import { DatabaseManager, ActiveFilter, ParentFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { IonSlides, ModalController } from '@ionic/angular';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { SettingsComponent, ManageSettings } from '../../components/settings/settings';

@Component({
  selector: 'manage-page',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  private expanded_visions_: InflatedRecord.Vision[];
  private vision_index_;
  private send_to_week_mode_: boolean;
  private send_to_week_color_string_: string;
  private settings_: ManageSettings;

  private slide_options_ = {
    initialSlide: 0,
    speed: 400
  };

  @ViewChild(IonSlides, {static: false} )
  slides_: IonSlides;

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute,
              private modal_controller_: ModalController) {
    
      this.vision_index_ = 0;
      this.expanded_visions_ = [];
      this.send_to_week_mode_ = false;
      this.send_to_week_color_string_ = "black";
      
      // Default settings 
      this.settings_ = { show_completed: false };

      database_manager_.register_data_updated_callback("manage_page", async () => {
        this.expanded_visions_ = await ManagePage.get_expanded_visions(this.settings_, this.database_manager_)
      });
  }

  static async get_expanded_visions(settings: ManageSettings, database_manager: DatabaseManager): Promise<InflatedRecord.Vision[]>
  {
    let expanded_visions = await database_manager.query_visions();
        
    let task_filters = [];
    let goal_filters = [];

    if (!settings.show_completed)
    {
      task_filters.push(new ActiveFilter(true));
      goal_filters.push(new ActiveFilter(true));
    }

    for (let vision of expanded_visions)
    {
      await DatabaseInflator.inflate_vision(vision, database_manager, false, task_filters, goal_filters);
    }

    // Get directly-associated tasks
    // TODO: This is lame..
    for (let expanded_vision of expanded_visions)
    {        
      expanded_vision.extra.freestanding_tasks= await database_manager.query_tasks(task_filters.concat(new ParentFilter(expanded_vision.id, true)));
    }

    return expanded_visions;
  }

  goal_show_hide_tasks(vision_index: number, goal_index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_visions_[vision_index].children[goal_index].extra.expanded = 
      !this.expanded_visions_[vision_index].children[goal_index].extra.expanded;
  }

  add_goal_to_vision(vision_index: number)
  {
    // Get parent vision
    let parent_vision = this.expanded_visions_[vision_index];

    // Create blank goal
    let new_goal = InflatedRecord.construct_empty_node(InflatedRecord.Type.GOAL);
    
    // Set goal's parent ID
    new_goal.parent_id = parent_vision.id;

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_goal,
        
        // Display elements
        title: "New Goal",
        enable_associate: false,
        enable_completion_status: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.goal_add(new_task); },
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  add_task_to_vision(vision_index: number)
  {
    // Get parent vision
    let parent_vision = this.expanded_visions_[vision_index];

    // Create blank goal
    let new_task = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);
    
    // Set goal's parent ID
    new_task.parent_id = parent_vision.id;

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_task,
        
        // Display elements
        title: "New Task",
        enable_associate: false,
        enable_completion_status: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.task_add(new_task); },
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  add_new_vision()
  {
    let new_vision = InflatedRecord.construct_empty_node(InflatedRecord.Type.VISION);

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: new_vision,
        
        // Display elements
        title: "New Vision",
        enable_associate: false,
        enable_completion_status: false,

        // Callbacks
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.vision_add(new_task); },
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  edit_vision()
  {
    let vision = this.expanded_visions_[this.vision_index_];

    let configure_tgv_settings : ConfigureTgvPageSettings =
    {
        // Node to configure (must have type field correctly set)
        tgv_node: vision,
        
        // Display elements
        title: "Edit Vision",
        enable_associate: false,
        enable_completion_status: false,

        // Callbacks
        save_callback: (vision: InflatedRecord.TgvNode) => { this.database_manager_.vision_set_basic_attributes(vision); },
        delete_callback: undefined
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex()
  }

  toggle_set_to_week_mode()
  {
    this.send_to_week_mode_ = !this.send_to_week_mode_;
    this.send_to_week_color_string_ = this.send_to_week_color_string_ === "black" ? "primary" : "black";
  }

  async open_settings()
  {
    const modal = await this.modal_controller_.create({component: SettingsComponent, componentProps: {settings: this.settings_} });
    
    modal.onDidDismiss().then(async settings => {
      this.settings_ = settings.data;
      this.expanded_visions_ = await ManagePage.get_expanded_visions(this.settings_, this.database_manager_);
    });

    return await modal.present();
  }
}
