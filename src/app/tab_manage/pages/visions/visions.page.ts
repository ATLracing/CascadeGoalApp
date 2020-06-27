import { Component, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DatabaseManager, ParentFilter, DateCompletedContainsFilter, join_or, ActiveFilter, join_and, QueryFilter } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { IonSlides, LoadingController } from '@ionic/angular';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';
import { ManageSettings } from '../../components/settings/settings';
import { get_this_week } from 'src/app/providers/discrete_date';

@Component({
  selector: 'visions-page',
  templateUrl: 'visions.page.html',
  styleUrls: ['visions.page.scss']
})
export class VisionsPage implements OnDestroy {
  private expanded_visions_: InflatedRecord.Vision[];
  private vision_index_;
  private send_to_week_mode_: boolean;
  private settings_: ManageSettings;
  private loaded_: boolean; // TODO: Hacky way to hide the "Add Vision" button while loading

  private slide_options_ = {
    initialSlide: 0,
    speed: 400
  };

  @Output() vision_changed = new EventEmitter<InflatedRecord.Vision>();
  
  @ViewChild(IonSlides, {static: false} )
  slides_: IonSlides;

  constructor(private database_manager_: DatabaseManager,
              private addressed_transfer_: AddressedTransfer,
              private router_: Router,
              private route_: ActivatedRoute,
              private loading_controller_: LoadingController) {
    
      this.vision_index_ = 0;
      this.expanded_visions_ = [];
      this.send_to_week_mode_ = false;
      
      // Default settings 
      this.settings_ = { show_completed: false };

      database_manager_.register_data_updated_callback("visions_page", async () => {
        await this.get_expanded_visions(this.settings_, this.database_manager_)
      });
  }

  @Input()
  set settings(settings: ManageSettings)
  {
    this.settings_ = settings;
    this.get_expanded_visions(this.settings_, this.database_manager_);  // TODO
  }

  @Input() 
  set send_to_week_mode(send_to_week_mode: boolean)
  {
    this.send_to_week_mode_ = send_to_week_mode;
  }

  async get_expanded_visions(settings: ManageSettings, database_manager: DatabaseManager)
  {
    // Loading controller
    const loading = await this.loading_controller_.create({
      cssClass: 'page-loading-spinner',
      message: '',
      duration: 0 // infinite
    });

    this.loaded_ = false;
    await loading.present();

    let expanded_visions = await database_manager.query_visions();
        
    let settings_filter = undefined;
    if (!settings.show_completed)
    {
      settings_filter = join_or(new DateCompletedContainsFilter(get_this_week()), new ActiveFilter(true));
    }

    for (let vision of expanded_visions)
    {
      await DatabaseInflator.inflate_vision(vision, database_manager, false, settings_filter, settings_filter);
    }

    // Get directly-associated tasks
    // TODO: This is lame..
    for (let expanded_vision of expanded_visions)
    { 
      let vision_parent_filter : QueryFilter = new ParentFilter(expanded_vision.id, true);

      if (settings_filter)
        vision_parent_filter = join_and(vision_parent_filter, settings_filter);

      expanded_vision.extra.freestanding_tasks= await database_manager.query_tasks(vision_parent_filter);
    }

    if (this.expanded_visions_.length > 0)
          this.vision_changed.emit(this.expanded_visions_[0]);

    this.expanded_visions_ = expanded_visions;

    if (this.expanded_visions_.length > 0)
          this.vision_changed.emit(this.expanded_visions_[await this.slides_.getActiveIndex()]);

    this.loaded_ = true;
    await loading.dismiss();
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
        save_callback: (new_vision: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_vision); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
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
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
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
        save_callback: (new_task: InflatedRecord.TgvNode) => { this.database_manager_.tgv_add(new_task); },
        delete_callback: null
    };

    this.addressed_transfer_.put_for_route(this.router_, 'configure_tgv', 'settings', configure_tgv_settings);
    this.router_.navigate(['configure_tgv'], { relativeTo: this.route_} );
  }

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex();
    this.vision_changed.emit(this.expanded_visions_[this.vision_index_]);
  }

  ngOnDestroy()
  {
    this.database_manager_.unregister_data_updated_callback("visions_page");
  }
}
