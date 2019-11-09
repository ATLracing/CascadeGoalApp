import { Component, ViewChild } from '@angular/core';
import { DatabaseManager, DatabaseHelper, ExpandedGoal, ExpandedTask, Task, Goal, ExpandedVision } from 'src/app/providers/database_manager';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { IonSlides, IonLabel } from '@ionic/angular';

@Component({
  selector: 'manage-page',
  templateUrl: 'manage.page.html',
  styleUrls: ['manage.page.scss']
})
export class ManagePage {
  private expanded_visions_: ExpandedVision[];
  private expanded_goals_arrays_: boolean[][];
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
    
      this.expanded_goals_arrays_ = [];
      this.vision_index_ = 0;

      database_manager_.register_data_updated_callback("manage_page", () => {
      this.expanded_visions_ = DatabaseHelper.query_visions(this.database_manager_);

      let new_expanded_goals_arrays_ = [];

      for (let expanded_vision of this.expanded_visions_)
      {
        let new_expanded_goal_array = [];

        for (let i = 0; i < expanded_vision.child_goals.length; i++)
        {
          new_expanded_goal_array.push(false);
        }

        new_expanded_goals_arrays_.push(new_expanded_goal_array);
      }

      this.expanded_goals_arrays_ = new_expanded_goals_arrays_;
    });
  }

  goal_show_hide_tasks(vision_index: number, goal_index: number)
  {
    console.log("Show/hide tasks");
    this.expanded_goals_arrays_[vision_index][goal_index] = !this.expanded_goals_arrays_[vision_index][goal_index];
  }

  add_task_to_goal(vision_index: number, goal_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'callback', (new_task: Task) => {
      new_task.parent_id = this.expanded_visions_[vision_index].child_goals[goal_index].unique_id;
      let new_task_id = this.database_manager_.add_task(new_task);
    });

    this.addressed_transfer_.put_for_route(this.router_, 'new_task', 'settings', { preset_goal: true});
    this.router_.navigate(['new_task'], { relativeTo: this.route_ });
  }

  add_goal_to_vision(vision_index: number)
  {
    // TODO If something changes in another pane.. not good
    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'callback', (new_goal: Goal) => {
      new_goal.parent_id = this.expanded_visions_[vision_index].unique_id;
      this.database_manager_.add_goal(new_goal);
    });

    this.addressed_transfer_.put_for_route(this.router_, 'new_goal', 'settings', { preset_vision: true});

    this.router_.navigate(['new_goal'], { relativeTo: this.route_ });
  }

  add_new_vision()
  {
    this.addressed_transfer_.put_for_route(this.router_, 'new_vision', 'callback', (new_vision) => {
      this.database_manager_.add_vision(new_vision);
    });

    this.router_.navigate(['new_vision'], { relativeTo: this.route_ });
  }

  async slide_changed()
  {
    this.vision_index_ = await this.slides_.getActiveIndex()
  }
}
