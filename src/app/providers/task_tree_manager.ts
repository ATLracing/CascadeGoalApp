import { Injectable } from "@angular/core";
import { DatabaseManager } from './database_manager';

@Injectable()
export class TaskTreeManager
{
    constructor(private database_manager_: DatabaseManager)
    {
        
    }
}