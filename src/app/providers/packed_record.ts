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
     year: number;

     day_completed: number;
     week_completed: number;
     year_completed: number;

     abandoned_day_count: number;
     abandoned_week_count: number;

     constructor(inflated_node : InflatedRecord.TgvNode)
     {
        this.id = inflated_node.id;
        this.owner = inflated_node.owner;
        this.users = JSON.stringify(inflated_node.users);
        this.parent_id = inflated_node.parent_id;
    
        this.type = inflated_to_packed_type(inflated_node.type);
        
        this.name = inflated_node.name;
        this.details = inflated_node.details;
        this.date_created = inflated_node.date_created ? inflated_node.date_created.toISOString() : undefined;
        this.date_closed = inflated_node.date_closed ? inflated_node.date_closed.toISOString() : undefined;
        this.resolution = inflated_node.resolution;

        this.day = inflated_node.discrete_date.day;
        this.week = inflated_node.discrete_date.week;
        this.year = inflated_node.discrete_date.year;

        this.day_completed = inflated_node.discrete_date_completed.day;
        this.week_completed = inflated_node.discrete_date_completed.week;
        this.year_completed = inflated_node.discrete_date_completed.year;

        this.abandoned_day_count = inflated_node.abandoned_day_count;
        this.abandoned_week_count = inflated_node.abandoned_week_count;
     }
};

export class Task   extends TgvNode {};
export class Goal   extends TgvNode {};
export class Vision extends TgvNode {};