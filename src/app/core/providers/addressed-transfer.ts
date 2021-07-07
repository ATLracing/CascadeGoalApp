import { Injectable } from "@angular/core"
import { Router } from '@angular/router';

@Injectable()
export class AddressedTransfer
{
    private static storage_ : Map<string, any>;
    private static initialized_: boolean;
    
    constructor() {
        if (!AddressedTransfer.initialized_)
        {
            AddressedTransfer.storage_ = new Map<string, any>();
            AddressedTransfer.initialized_ = true;
        }
    }
    get(message_id: string)
    {
        console.log("GET: " + message_id);
        console.log(AddressedTransfer.storage_.get(message_id));
        return AddressedTransfer.storage_.get(message_id);   // Redundant?
    }

    clear(message_id: string)
    {
        AddressedTransfer.storage_.set(message_id, undefined);
    }

    put(message_id: string, data: any)
    {
        console.log("PUT: " + message_id);
        AddressedTransfer.storage_.set(message_id, data);
    }

    put_for_route(router: Router, relative_url: string, message_id_suffix: string, data: any)
    {
        let message_id = router.url + "/" + relative_url + "_" + message_id_suffix;
        this.put(message_id, data);
    }

    get_for_route(router: Router, message_id_suffix: string)
    {
        let message_id = router.url + "_" + message_id_suffix;
        return this.get(message_id);
    }
}