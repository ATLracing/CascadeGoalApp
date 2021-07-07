import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

export class ManageSettings
{
  constructor()
  {
    this.show_completed = false;
    this.show_dormant = false;
  }

  show_completed: boolean;
  show_dormant: boolean;
};

@Component({
  selector: 'settings-component',
  templateUrl: 'settings.html',
})
export class SettingsComponent implements OnInit {
  @Input() settings: ManageSettings;

  constructor(private modal_controller_: ModalController) 
  {
  }

  save()
  {
    this.modal_controller_.dismiss(this.settings);
  }

  ngOnInit()
  {
  }
}
