 /*
 * --------------------------------------- Brief design note ---------------------------------------
 * The contents of this namespace are a bit ad hoc and ought to be refined/formalized. For now, 
 * inflated records inflate all nodes beneath them recursively (with optional filtering capabilities 
 * that aren't super efficient). Inflated records inflate nodes above them non-recursively.
 */

import * as PackedRecord from 'src/app/providers/packed_record';
import { CalendarManager } from './calendar_manager';

export type ID = number;

export enum Resolution
{
    ACTIVE = 0,
    COMPLETE = 1,
    WONT_DO = 2,
    DELETED = 3
};

export const NULL_DATE = new Date(0);
export const NULL_ID = -1;
export const NULL_DAY = -1;
export const NULL_WEEK = -1;

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

    day: number;
    week: number;

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
        this.date_created = new Date(packed_node.date_created);
        this.date_closed = new Date(packed_node.date_closed);
        this.resolution = packed_node.resolution;
        
        this.day = packed_node.day;
        this.week = packed_node.week;

        this.parent_id = packed_node.parent_id;

        this.extra = {};
    }
};

export function construct_empty_node(type: Type) : TgvNode
{
    return { parent: undefined,
             children: undefined,
             id: NULL_ID,
             owner: "",
             users: [],
             type: type,
             name: "",
             details: "",
             date_created: new Date(),
             date_closed: NULL_DATE,
             resolution: Resolution.ACTIVE,
             day: NULL_DAY,
             week: NULL_WEEK,
             parent_id: NULL_ID,
             extra: undefined
            };
}

export function copy_node(node: TgvNode) : TgvNode
{
    let copy = JSON.parse(JSON.stringify(node));
    
    copy.date_closed  = new Date(copy.date_closed);
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

export class Task   extends TgvNode{};
export class Goal   extends TgvNode{};
export class Vision extends TgvNode{};

export function is_active(node : TgvNode) : boolean
{
    return JSON.stringify(node.date_closed) === JSON.stringify(NULL_DATE);
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

export function resolve(resolution: Resolution, /*out*/ node: TgvNode)
{
    node.resolution = resolution;

    if (resolution == Resolution.ACTIVE)
    {
        node.date_closed = NULL_DATE;
    }
    else
    {
        node.date_closed = CalendarManager.get_date();
    }
}