import { Component, Input, OnInit } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'associate-component',
  templateUrl: 'associate.html',
})
export class ComponentAssociate implements OnInit {
  @Input() is_task: boolean;

  private visions_: InflatedRecord.Vision[];
  private goals_: InflatedRecord.Goal[];
  private tab_: string;

  constructor(private modal_controller_: ModalController, 
              private database_manager_ : DatabaseManager) 
  {
    database_manager_.query_visions().then(visions => { this.visions_ = visions; });
    database_manager_.query_goals().then(goals => { this.goals_ = goals; })
  }

  segment_changed(event)
  {
    this.tab_ = event.detail.value;
  }

  select(i)
  {
    if (i == -1)
    {
      this.modal_controller_.dismiss(undefined);
    }
    else if (this.tab_ === "goals")
    {
      this.modal_controller_.dismiss(this.goals_[i].id);
    }
    else
    {
      this.modal_controller_.dismiss(this.visions_[i].id);
    }
  }

  ngOnInit()
  {
    if (this.is_task)
      this.tab_ = "goals";
    else
      this.tab_ = "visions";
  }
}
