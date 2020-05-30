import { Component } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'associate-component',
  templateUrl: 'associate.html',
  styleUrls: ['associate.scss']
})
export class ComponentAssociate {
  private visions_: InflatedRecord.Vision[];
  private goals_: InflatedRecord.Goal[];

  private tab_: string;

  constructor(private modal_controller_: ModalController, 
              private database_manager_ : DatabaseManager) 
  {
    this.tab_ = "goals";

    database_manager_.register_data_updated_callback("new_task_associate_page", async () => {
      this.visions_ = await database_manager_.query_visions();
      this.goals_ = await database_manager_.query_goals();
    });
  }

  segment_changed(event)
  {
    this.tab_ = event.detail.value;
  }

  select(i)
  {
    if (this.tab_ === "goals")
    {
      this.modal_controller_.dismiss(this.goals_[i].id);
    }
    else
    {
      this.modal_controller_.dismiss(this.visions_[i].id);
    }

  }
}
