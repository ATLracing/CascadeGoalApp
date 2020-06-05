import { Component, OnDestroy } from '@angular/core';
import { DatabaseManager } from 'src/app/providers/database_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { DatabaseInflator } from 'src/app/providers/database_inflator';
import { ModalController } from '@ionic/angular';
import { ComponentAssociate } from '../../components/associate/associate';

export class NewTaskPageSettings
{
  parent_id: InflatedRecord.ID;
}

@Component({
  selector: 'new-task-page',
  templateUrl: 'new_task.page.html',
  styleUrls: ['new_task.page.scss']
})
export class NewTaskPage implements OnDestroy {
  private all_goals_: InflatedRecord.Goal[];
  private new_task_: InflatedRecord.Task;
  private input_settings_: NewTaskPageSettings;

  constructor(private database_manager_: DatabaseManager,
              private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer,
              private modal_controller_: ModalController)
  {
    this.new_task_ = InflatedRecord.construct_empty_node(InflatedRecord.Type.TASK);

    this.input_settings_ = this.addressed_transfer_.get_for_route(router_, "settings");
    
    // TODO: Fuck this..
    if (this.input_settings_ == undefined)
      this.input_settings_ = new NewTaskPageSettings();

    this.new_task_.parent_id = this.input_settings_.parent_id;

    database_manager_.register_data_updated_callback("new_task_page", async () => {
      this.all_goals_ = await database_manager_.query_goals([]);  // and this..

    });

    console.log("New Task constructed");
  }

  async associate()
  {
    const modal = await this.modal_controller_.create({component: ComponentAssociate});
    
    modal.onDidDismiss().then(id => {
      // TODO
      console.log(id.data);
      this.new_task_.parent_id = id.data;
    });
    return await modal.present();
  }

  save()
  {
    // TODO(ABurroughs): Just add the task here..
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_task_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }

  ngOnDestroy()
  {
    console.log("New Task destroyed");
    this.database_manager_.unregister_data_updated_callback("new_task_page");
  }
}
