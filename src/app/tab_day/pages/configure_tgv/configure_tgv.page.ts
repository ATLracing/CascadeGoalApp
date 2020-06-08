import { Component } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ModalController, AlertController } from '@ionic/angular';
import { ComponentAssociate } from '../../components/associate/associate';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { ComponentSetCompletion } from '../../components/set_completion/set_completion';

export class ConfigureTgvPageSettings
{
  // Node to configure (must have type field correctly set)
  tgv_node: InflatedRecord.TgvNode;

  // Display elements
  title: string;
  enable_associate: boolean;
  enable_completion_status: boolean;

  // Callbacks
  save_callback: (tgv_node: InflatedRecord.TgvNode) => void;
  delete_callback: (tgv_node: InflatedRecord.TgvNode) => void;
}

@Component({
  selector: 'configure-tgv-page',
  templateUrl: 'configure_tgv.page.html',
})
export class ConfigureTgvPage {
  private tgv_node_: InflatedRecord.TgvNode;
  private settings_: ConfigureTgvPageSettings;
  private parent_name_: string;

  constructor(private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer,
              private modal_controller_: ModalController,
              private alert_controller_: AlertController,
              private database_manager_: DatabaseManager)
  {
    // Retrieve page settings
    this.settings_ = this.addressed_transfer_.get_for_route(router_, "settings");
    this.tgv_node_ = InflatedRecord.copy_node(this.settings_.tgv_node);

    // Set parent string
    this.parent_name_ = "";
    this.update_parent(this.tgv_node_.parent_id);
  }

  update_parent(parent_id: InflatedRecord.ID)
  {
    this.tgv_node_.parent_id = parent_id;

    if (this.tgv_node_.parent_id != InflatedRecord.NULL_ID)
    {
      this.database_manager_.get_node(this.tgv_node_.parent_id).then(parent => {
        this.parent_name_ = parent.name;
      });
    }
    else
    {
      this.parent_name_ = "Unassociated";
    }
  }

  async associate()
  {
    const modal = await this.modal_controller_.create({component: ComponentAssociate, componentProps: { is_task: this.tgv_node_.type == InflatedRecord.Type.TASK } });
    
    modal.onDidDismiss().then(id => {
      this.update_parent(id.data);
    });

    return await modal.present();
  }

  set_resolution(event_data)
  {
    let resolution = event_data.detail.value;
    InflatedRecord.resolve(resolution, /*out*/this.tgv_node_);
  }

  save()
  {
    this.settings_.save_callback(this.tgv_node_);
    this.router_.navigate(['../'], { relativeTo: this.route_});
  }

  async delete()
  {
    let confirmation_alert = await this.alert_controller_.create({
      header: 'Delete?',
      message: 'This action cannot be undone',
      buttons: ['Cancel', {text: 'OK', handler: () => { 
        this.settings_.delete_callback(this.tgv_node_);
        this.router_.navigate(['../'], { relativeTo: this.route_});
       }}]
    });

    await confirmation_alert.present();
    await confirmation_alert.onDidDismiss(); // Any reason to have this?
  }
}
