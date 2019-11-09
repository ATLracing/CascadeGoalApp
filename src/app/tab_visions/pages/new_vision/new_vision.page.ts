import { Component } from '@angular/core';
import { DatabaseHelper, Vision } from 'src/app/providers/database_manager';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressedTransfer } from 'src/app/providers/addressed_transfer';

@Component({
  selector: 'new-vision-page',
  templateUrl: 'new_vision.page.html',
  styleUrls: ['new_vision.page.scss']
})
export class NewVisionPage {
  private new_vision_: Vision;

  constructor(private router_: Router,
              private route_: ActivatedRoute,
              private addressed_transfer_: AddressedTransfer)
  {
    this.new_vision_ = DatabaseHelper.create_blank_goal();
    console.log("New Vision constructed");
  }

  save()
  {
    this.addressed_transfer_.get_for_route(this.router_, "callback")(this.new_vision_);
    this.router_.navigate(['../'], { relativeTo: this.route_} );
  }
}
