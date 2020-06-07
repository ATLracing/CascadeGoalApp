import { Component, ViewChild } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { IonSlides } from '@ionic/angular';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import { ConfigureTgvPageSettings } from 'src/app/tab_day/pages/configure_tgv/configure_tgv.page';

@Component({
  selector: 'manage-page',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  private expanded_visions_: InflatedRecord.Vision[];
  private vision_index_;
  private slide_options_ = {
    initialSlide: 0,
    speed: 400
  };

  @ViewChild(IonSlides, {static: false} )
  slides_: IonSlides;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer) {
    
      this.vision_index_ = 0;
      this.expanded_visions_ = [];

      database_manager_.register_data_updated_callback("manage_page", async () => {
      
      this.expanded_visions_ = await database_manager_.query_visions();

      for (let vision of this.expanded_visions_)
      {
        await DatabaseInflator.inflate_vision(vision, database_manager_, false);
      }

      // Tack on UI info
      for (let expanded_vision of this.expanded_visions_)
      {
        for (let expanded_goal of expanded_vision.children)
        {
          expanded_goal.extra = { expanded: false };
        }
      }

    });
  }

  goal_show_hide_tasks(vision_index: number, goal_index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_visions_[vision_index].children[goal_index].extra.expanded = 
      !this.expanded_visions_[vision_index].children[goal_index].extra.expanded;
  }

  add_task_to_goal(vision_index: number, goal_index: number)
  {

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

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex()
  }
}
