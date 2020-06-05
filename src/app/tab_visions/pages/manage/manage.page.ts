import { Component, ViewChild } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { IonSlides } from '@ionic/angular';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { CalendarManager } from 'src/app/providers/calendar_manager';

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

  async add_task_to_goal(vision_index: number, goal_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', async (new_task: InflatedRecord.Task) => {      
      await this.database_manager_.task_add(new_task);
    });

    let parent_goal_id = this.expanded_visions_[vision_index].children[goal_index].id;
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'settings', { parent_id: parent_goal_id});
    this.router_.navigate(['new_task'], { relativeTo: this.route_ });
  }

  async add_goal_to_vision(vision_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'callback', async (new_goal: InflatedRecord.Goal) => {
      await this.database_manager_.goal_add(new_goal);
    });

    let parent_vision_id = this.expanded_visions_[vision_index].id;
    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'settings', { parent_id: parent_vision_id});

    this.router_.navigate(['new_goal'], { relativeTo: this.route_ });
  }

  async add_new_vision()
  {
    this.addressed_transfer_.put_for_route(this.router_, 'new_vision', 'callback', (new_vision: InflatedRecord.Vision) => {
      this.database_manager_.vision_add(new_vision);
    });

    this.router_.navigate(['new_vision'], { relativeTo: this.route_ });
  }

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex()
  }
}
