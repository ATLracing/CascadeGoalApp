import { Component, ViewChild } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
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

      database_manager_.register_data_updated_callback("manage_page", () => {
      this.expanded_visions_ = DatabaseInflator.query_visions(this.database_manager_);

      // Tack on UI info
      for (let expanded_vision of this.expanded_visions_)
      {
        for (let expanded_goal of expanded_vision.child_goals)
        {
          expanded_goal.extra = { expanded: false };
        }
      }

    });
  }

  goal_show_hide_tasks(vision_index: number, goal_index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_visions_[vision_index].child_goals[goal_index].extra.expanded = 
      !this.expanded_visions_[vision_index].child_goals[goal_index].extra.expanded;
  }

  add_task_to_goal(vision_index: number, goal_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', (new_task: PackedRecord.Task) => {      
      let new_task_id = this.database_manager_.task_add(new_task.name, new_task.details, CalendarManager.get_date(), PackedRecord.DateIncomplete, PackedRecord.GROUP_LOCAL, true);
      
      let parent_goal_id = this.expanded_visions_[vision_index].child_goals[goal_index].unique_id;

      this.database_manager_.task_set_parent(new_task_id, parent_goal_id);
    });

    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'settings', { preset_goal: true});
    this.router_.navigate(['new_task'], { relativeTo: this.route_ });
  }

  add_goal_to_vision(vision_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'callback', (new_goal: PackedRecord.Goal) => {
      let new_goal_id = this.database_manager_.goal_add(new_goal.name, new_goal.details, CalendarManager.get_date(), PackedRecord.DateIncomplete, PackedRecord.GROUP_LOCAL, true);

      let parent_vision_id = this.expanded_visions_[vision_index].unique_id;
      this.database_manager_.goal_set_parent(parent_vision_id, new_goal_id);
    });

    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'settings', { preset_vision: true});

    this.router_.navigate(['new_goal'], { relativeTo: this.route_ });
  }

  add_new_vision()
  {
    this.addressed_transfer_.put_for_route(this.router_, 'new_vision', 'callback', (new_vision: PackedRecord.Vision) => {
      this.database_manager_.vision_add(new_vision.name, new_vision.details, CalendarManager.get_date(), PackedRecord.DateIncomplete, PackedRecord.GROUP_LOCAL);
    });

    this.router_.navigate(['new_vision'], { relativeTo: this.route_ });
  }

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex()
  }
}
