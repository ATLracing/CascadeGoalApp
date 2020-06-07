import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

export class ManageSettings
{
  show_completed: boolean;
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
