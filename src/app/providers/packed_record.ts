import * as InflatedRecord from 'src/app/providers/inflated_record';


// ========================================================================================== Tables
export const TGV_TABLE  = "tgv_nodes_tbl";
export const DAY_TABLE  = "day_tbl";
export const WEEK_TABLE = "week_tbl";

// ==================================================================================== Record Types
export class Type
{
    static TASK = "task";
    static GOAL = "goal";
    static VISION = "vision";    
}

export function inflated_to_packed_type(type: InflatedRecord.Type) : string
{
    if (type == InflatedRecord.Type.TASK)
        return Type.TASK;
    if (type == InflatedRecord.Type.GOAL)
        return Type.GOAL;
    
    return Type.VISION;
}

export const NULL_ID = -1;          // TODO: Just use SQL NULL?
export const NULL_DATE_STR = InflatedRecord.NULL_DATE.toISOString();

export const TGV_NODE_COLUMNS = "id, owner, users, parent_id, type, name, details, date_created, date_closed, resolution, day, week";

export class TgvNode
 {
     id: number;
     owner: string;
     users: string;
     parent_id: number;
 
     type: string;
     
     name: string;
     details: string;
     date_created: string;
     date_closed: string;
     resolution: number;

     day: number;
     week: number;

     constructor(inflated_node : InflatedRecord.TgvNode)
     {
        this.id = inflated_node.id;
        this.owner = inflated_node.owner;
        this.users = JSON.stringify(inflated_node.users);
        this.parent_id = inflated_node.parent_id;
    
        this.type = inflated_to_packed_type(inflated_node.type);
        
        this.name = inflated_node.name;
        this.details = inflated_node.details;
        this.date_created = inflated_node.date_created.toISOString();
        this.date_closed = inflated_node.date_closed.toISOString();
        this.resolution = inflated_node.resolution;

        this.day = inflated_node.day;
        this.week = inflated_node.week;
     }
};

export class Task   extends TgvNode {};
export class Goal   extends TgvNode {};
export class Vision extends TgvNode {};