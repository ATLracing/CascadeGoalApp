import { Component, Input, OnInit } from '@angular/core';
import { ActiveFilter, DatabaseManager } from 'src/app/providers/database_manager';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { ModalController } from '@ionic/angular';

export class AssociateReturnValue
{
  parent_id : InflatedRecord.ID;
}

@Component({
  selector: 'associate-component',
  templateUrl: 'associate.html',
  styleUrls: ['associate.scss'],
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
    database_manager_.query_goals(new ActiveFilter()).then(goals => { this.goals_ = goals; })
  }

  segment_changed(event)
  {
    this.tab_ = event.detail.value;
  }

  select(i)
  {
    let id : InflatedRecord.ID = this.tab_ === "goals" ? this.goals_[i].id : this.visions_[i].id;

    let retval : AssociateReturnValue = { parent_id: id };
    this.modal_controller_.dismiss(retval);
  }

  clear()
  {
    let retval : AssociateReturnValue = { parent_id: null };
    this.modal_controller_.dismiss(retval);
  }

  back()
  {
    this.modal_controller_.dismiss(null);
  }

  ngOnInit()
  {
    if (this.is_task)
      this.tab_ = "goals";
    else
      this.tab_ = "visions";
  }
}
