import { Component } from '@angular/core';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'new-vision-page',
  templateUrl: 'new_vision.page.html',
  styleUrls: ['new_vision.page.scss']
})
export class NewVisionPage {
  private new_vision_: InflatedRecord.Vision;

  constructor(private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.new_vision_ = InflatedRecord.construct_empty_node(InflatedRecord.Type.VISION)
    console.log("New Vision constructed");
  }

  save()
  {
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_vision_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }
}
