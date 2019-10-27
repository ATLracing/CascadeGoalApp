import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  private slideOpts = {
    initialSlide: 1,
    speed: 400
  };

  constructor() {}

}
