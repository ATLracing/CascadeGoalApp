 /*
 * --------------------------------------- Brief design note ---------------------------------------
 * The contents of this namespace are a bit ad hoc and ought to be refined/formalized. For now, 
 * inflated records inflate all nodes beneath them recursively (with optional filtering capabilities 
 * that aren't super efficient). Inflated records inflate nodes above them non-recursively.
 */

import * as PackedRecord from 'src/app/core/providers/packed-record';
import { DiscreteDate, get_null_date, get_today, prior_to, get_this_week, get_level, DiscreteDateLevel } from './discrete-date';
import * as _ from 'lodash';

export type ID = number;

export enum Resolution
{
    ACTIVE = 0,
    COMPLETE,
    WONT_DO,
    DORMANT,    // TODO: Not really a resolution..
    DELETED
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
        this.parent = null;
        this.children = null;

        // Node info
        this.id = packed_node.id;
        this.owner = packed_node.owner;
        this.users = JSON.parse(packed_node.users);

        this.type = packed_to_inflated_type(packed_node.type);
        
        this.name = packed_node.name;
        this.details = packed_node.details;
        this.date_created = packed_node.date_created ? new Date(packed_node.date_created) : null;
        this.date_closed = packed_node.date_closed ? new Date(packed_node.date_closed) : null;
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
    return { parent: null,
             children: null,
             id: null,
             owner: "",
             users: [],
             type: type,
             name: "",
             details: "",
             date_created: new Date(),
             date_closed: null,
             resolution: Resolution.ACTIVE,
             discrete_date: get_null_date(),
             discrete_date_completed: get_null_date(),
             abandoned_day_count: 0,
             abandoned_week_count: 0,
             parent_id: null,
             extra: null
            };
}

export function copy_node(node: TgvNode) : TgvNode
{
    // Save parent/children
    let parent = node.parent;
    let children = node.children;

    // Clear parent/children
    node.parent = null
    node.children = [];

    // Copy
    let copy = JSON.parse(JSON.stringify(node));
    
    // Restore parent/children
    node.parent = parent;
    node.children = children;

    // Add parent/children to copy (these are not copied)
    copy.parent = parent;
    copy.children = children;

    // TODO: Redundant with null?
    copy.date_closed  = node.date_closed ? new Date(copy.date_closed) : null;
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
        case Resolution.DORMANT: return "Dormant";
        case Resolution.DELETED: return "Deleted";
    }
}

export class Task   extends TgvNode{};
export class Goal   extends TgvNode{};
export class Vision extends TgvNode{};

// ============================================================================ Query for Properties
// COMPLETE == WONT_DO > DORMANT > ACTIVE, tie goes to the parent (inherited), EXCEPT when ACTIVE
export function is_resolution_inherited(node: TgvNode)
{
    if (node.parent != undefined)
    {
        if (node.parent.resolution == Resolution.COMPLETE || node.parent.resolution == Resolution.WONT_DO)
            return true;
        if (node.parent.resolution == Resolution.DORMANT && !(node.resolution == Resolution.COMPLETE || node.resolution == Resolution.WONT_DO))
            return true;
    }
    
    return false;
}

export function get_resolution(node : TgvNode): Resolution
{
    if (is_resolution_inherited(node))
        return node.parent.resolution;
    
    return node.resolution;
}

export function is_active(node : TgvNode) : boolean
{
    return get_resolution(node) == Resolution.ACTIVE;
}

export function is_complete(node : TgvNode) : boolean
{
    let resolution = get_resolution(node);
    return resolution == Resolution.COMPLETE || resolution == Resolution.WONT_DO;
}

export function is_dormant(node : TgvNode) : boolean
{
    return get_resolution(node) == Resolution.DORMANT;
}

export function is_overdue(node : TgvNode) : boolean
{
    return is_active(node) && prior_to(node.discrete_date, get_today());
}

// ========================================================================================= Actions
// TODO(ABurroughs): This ought to be in the database layer itself
export function resolve(resolution: Resolution, /*out*/ node: TgvNode)
{
    node.resolution = resolution;

    if (resolution == Resolution.ACTIVE || resolution == Resolution.DORMANT)
    {
        node.date_closed = null;
        node.discrete_date_completed = get_null_date();
    }
    else
    {
        node.date_closed = new Date();
        node.discrete_date_completed = get_today();
    }
}

export function set_date(date: DiscreteDate, /*out*/ node: TgvNode)
{
    let today = get_today();
    let this_week = get_this_week();
    
    if (is_active(node))  // TODO(ABurroughs): Completed tasks shouldn't be moved anyway
    {
        if (prior_to(node.discrete_date, this_week) && get_level(node.discrete_date) == DiscreteDateLevel.WEEK)
        {
            node.abandoned_week_count++;

            if (get_level(node.discrete_date) == DiscreteDateLevel.DAY)
                node.abandoned_day_count++;
        }
        else if (prior_to(node.discrete_date, today) && get_level(node.discrete_date) == DiscreteDateLevel.DAY)
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

// export function set_this_week(/*out*/ node: TgvNode)
// {
//     set_date(get_this_week(), node);
// }

export function clear_day(/*out*/ node: TgvNode)
{
    set_date({day: null, week: node.discrete_date.week, year: node.discrete_date.year}, node);
}

export function clear_week(/*out*/ node: TgvNode)
{
    set_date(get_null_date(), node);
}

// TODO(ABurroughs): Possibly useless
export function update(updated_node_list: TgvNode[], existing_node_list: TgvNode[])
{
    if (updated_node_list.length != existing_node_list.length)
        return false;


    for (let i = 0; i < updated_node_list.length; i++)
    {
        let existing = existing_node_list[i];
        let updated = updated_node_list[i];

        let update = existing == null;

        if (!update)
        {
            let existing_packed = new PackedRecord.TgvNode(existing);
            let updated_packed = new PackedRecord.TgvNode(updated);
            update = !_.isEqual(existing_packed, updated_packed);
        }

        if (update)
        {
            // DEBUG
            if (existing)
            {
                let existing_packed = new PackedRecord.TgvNode(existing);
                let updated_packed = new PackedRecord.TgvNode(updated);
                let a = 0;
            }
            
            existing_node_list[i] = updated;
        }
    }

    return true;
}