 /*
 * --------------------------------------- Brief design note ---------------------------------------
 * The contents of this namespace are a bit ad hoc and ought to be refined/formalized. For now, 
 * inflated records inflate all nodes beneath them recursively (with optional filtering capabilities 
 * that aren't super efficient). Inflated records inflate nodes above them non-recursively.
 */

import * as PackedRecord from 'src/app/providers/packed_record';
import { CalendarManager } from './calendar_manager';
import { DiscreteDate, get_null_date, get_today, prior_to, get_this_week, get_level, DiscreteDateLevel } from './discrete_date';

export type ID = number;

export enum Resolution
{
    ACTIVE = 0,
    COMPLETE = 1,
    WONT_DO = 2,
    DELETED = 3
};

export enum Type
{
    TASK,
    GOAL,
    VISION
};

export function packed_to_inflated_type(type: PackedRecord.Type) : Type
{
    if (PackedRecord.Type.TASK === type)
    { 
        return Type.TASK;
    }
    if (PackedRecord.Type.GOAL === type)
    {
        return Type.GOAL;
    }

    return Type.VISION;
}

export class TgvNode
{
    // Node pointers
    parent : TgvNode;
    children: TgvNode[];

    // Node info
    id: ID;
    owner: string;
    users: string[];

    type: Type;
    
    name: string;
    details: string;
    date_created: Date;
    date_closed: Date;
    resolution: Resolution;

    discrete_date: DiscreteDate;
    discrete_date_completed: DiscreteDate;

    abandoned_day_count: number;
    abandoned_week_count: number;

    // Packed node info
    parent_id: ID;

    // UI 
    extra: any; // For UI components to bind additional info

    constructor(packed_node: PackedRecord.TgvNode)
    {
        // Node pointers
        this.parent = undefined;
        this.children = undefined;

        // Node info
        this.id = packed_node.id;
        this.owner = packed_node.owner;
        this.users = JSON.parse(packed_node.users);

        this.type = packed_to_inflated_type(packed_node.type);
        
        this.name = packed_node.name;
        this.details = packed_node.details;
        this.date_created = packed_node.date_created ? new Date(packed_node.date_created) : undefined;
        this.date_closed = packed_node.date_closed ? new Date(packed_node.date_closed) : undefined;
        this.resolution = packed_node.resolution;
        
        this.discrete_date = { day: packed_node.day, week: packed_node.week, year: packed_node.year };
        this.discrete_date_completed = { day: packed_node.day_completed, week: packed_node.week_completed, year: packed_node.year_completed };

        this.abandoned_day_count = packed_node.abandoned_day_count;
        this.abandoned_week_count = packed_node.abandoned_week_count;

        this.parent_id = packed_node.parent_id;

        this.extra = {};
    }
};

export function construct_empty_node(type: Type) : TgvNode
{
    return { parent: undefined,
             children: undefined,
             id: undefined,
             owner: "",
             users: [],
             type: type,
             name: "",
             details: "",
             date_created: new Date(),
             date_closed: undefined,
             resolution: Resolution.ACTIVE,
             discrete_date: get_null_date(),
             discrete_date_completed: get_null_date(),
             abandoned_day_count: 0,
             abandoned_week_count: 0,
             parent_id: undefined,
             extra: undefined
            };
}

export function copy_node(node: TgvNode) : TgvNode
{
    // TODO
    node.parent = undefined;
    node.children = [];

    let copy = JSON.parse(JSON.stringify(node));
    
    copy.parent = parent;
    copy.date_closed  = node.date_closed ? new Date(copy.date_closed) : undefined;
    copy.date_created = new Date(copy.date_created);
    
    return copy;
}

export function build_inflated(packed : PackedRecord.TgvNode) : TgvNode
{
    return new TgvNode(packed);
}

export function build_inflated_array(packed : PackedRecord.TgvNode[]) : TgvNode[]
{
    let inflated_array : TgvNode[] = [];
    
    for (let node of packed)
    {
        inflated_array.push(new TgvNode(node));
    }

    return inflated_array;
}

export function resolution_to_string(resolution: Resolution) : string
{
    switch(resolution)
    {
        case Resolution.ACTIVE: return "Active";
        case Resolution.COMPLETE: return "Complete";
        case Resolution.WONT_DO: return "Won't Do";
        case Resolution.DELETED: return "Deleted";
    }
}

export class Task   extends TgvNode{};
export class Goal   extends TgvNode{};
export class Vision extends TgvNode{};

// ============================================================================ Query for Properties
export function is_active(node : TgvNode) : boolean
{
    return node.date_closed == undefined;
}

// ========================================================================================= Actions
// TODO(ABurroughs): This ought to be in the database layer itself
export function resolve(resolution: Resolution, /*out*/ node: TgvNode)
{
    node.resolution = resolution;

    if (resolution == Resolution.ACTIVE)
    {
        node.date_closed = undefined;
        node.discrete_date_completed = get_null_date();
    }
    else
    {
        node.date_closed = CalendarManager.get_date();
        node.discrete_date_completed = get_today();
    }
}

export function set_date(date: DiscreteDate, /*out*/ node: TgvNode)
{
    let today = get_today();
    let this_week = get_this_week();
    
    if (is_active(node))  // TODO(ABurroughs): Completed tasks shouldn't be moved anyway
    {
        if (prior_to(node.discrete_date, this_week))
        {
            node.abandoned_week_count++;

            if (get_level(node.discrete_date) == DiscreteDateLevel.DAY)
                node.abandoned_day_count++;
        }
        else if (prior_to(node.discrete_date, today))
        {
            node.abandoned_day_count++;
        }
    }

    node.discrete_date = date;
}

export function set_today(/*out*/ node: TgvNode)
{
    set_date(get_today(), node);
}

export function set_this_week(/*out*/ node: TgvNode)
{
    set_date(get_this_week(), node);
}

export function clear_day(/*out*/ node: TgvNode)
{
    set_date({day: undefined, week: node.discrete_date.week, year: node.discrete_date.year}, node);
}

export function clear_week(/*out*/ node: TgvNode)
{
    set_date(get_null_date(), node);
}