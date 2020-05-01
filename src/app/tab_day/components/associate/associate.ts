import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'associate-component',
  templateUrl: 'associate.html',
  styleUrls: ['associate.scss']
})
export class ComponentAssociate {
  private visions_: PackedRecord.Vision[];
  private goals_: PackedRecord.Goal[];

  private tab_: string;

  constructor(private modal_controller_: ModalController, 
              private database_manager_ : DatabaseManager) 
  {
    this.tab_ = "goals";

    database_manager_.register_data_updated_callback("new_task_associate_page", () => {
      this.visions_ = database_manager_.get_visions();
      this.goals_ = database_manager_.get_goals();
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
      this.modal_controller_.dismiss(this.goals_[i].unique_id);
    }
    else
    {
      this.modal_controller_.dismiss(this.visions_[i].unique_id);
    }

  }
}
