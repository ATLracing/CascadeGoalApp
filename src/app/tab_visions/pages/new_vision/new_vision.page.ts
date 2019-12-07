import { Component } from '@angular/core';
import * as PackedRecord from 'src/app/providers/packed_record';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'new-vision-page',
  templateUrl: 'new_vision.page.html',
  styleUrls: ['new_vision.page.scss']
})
export class NewVisionPage {
  private new_vision_: PackedRecord.Vision;

  constructor(private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.new_vision_ = new PackedRecord.Vision();
    console.log("New Vision constructed");
  }

  save()
  {
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_vision_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }
}
