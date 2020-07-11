import { Component } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record'
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';
import { ModalController, AlertController } from '@ionic/angular';
import { ComponentAssociate } from '../../components/associate/associate';
import { DatabaseManager } from 'src/app/providers/database_manager';
import { get_dual_week_str, DiscreteDate, equals, contains } from 'src/app/providers/discrete_date';
import { ChangeWeekComponent } from '../../components/change-week/change-week.component';

// TODO(ABurroughs): Prevent editing conflicts (extremely unlikely in practice, but potentially 
// irritating)

export class ConfigureTgvPageSettings
{
  // Node to configure (must have type field correctly set)
  tgv_node: InflatedRecord.TgvNode;

  // Display elements
  title: string;
  enable_associate: boolean;
  enable_completion_status: boolean;
  enable_week_select: boolean;

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
  private is_to_active_: boolean; // TODO(ABurroughs): Hopefully remove
  private week_str_: string; // TODO(ABurroughs): Definitely remove

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

    // Determine active status
    this.is_to_active_ = InflatedRecord.is_active(this.tgv_node_);

    // Determine week string
    this.week_str_ = get_dual_week_str(this.tgv_node_.discrete_date);
  }

  update_parent(parent_id: InflatedRecord.ID)
  {
    this.tgv_node_.parent_id = parent_id;

    if (this.tgv_node_.parent_id)
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

    // Update active status
    this.is_to_active_ = InflatedRecord.is_active(this.tgv_node_);
  }

  async set_week()
  {
    const modal = await this.modal_controller_.create({component: ChangeWeekComponent, componentProps: { active_discrete_date: this.tgv_node_.discrete_date } });
  
    modal.onDidDismiss().then(async selected_week => {
      if (selected_week.data)
      {
        // Avoid clearing day information if a change has not actually been made
        if (!contains(this.tgv_node_.discrete_date, selected_week.data))
        {
          InflatedRecord.set_date(selected_week.data, this.tgv_node_);
          this.week_str_ = get_dual_week_str(this.tgv_node_.discrete_date);
        }
      }
    });

    return await modal.present();
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
