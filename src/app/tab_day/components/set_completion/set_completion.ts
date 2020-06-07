import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'set_completion-component',
  templateUrl: 'set_completion.html',
})
export class ComponentSetCompletion {
  constructor(private modal_controller_: ModalController) 
  {
  }

  select(i)
  {
    this.modal_controller_.dismiss("Data to send!");
  }
}
