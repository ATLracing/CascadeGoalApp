import { Injectable, Query } from '@angular/core';
import { CalendarManager } from 'src/app/providers/calendar_manager';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { inflate } from 'zlib';

// ============================================================================== Filter Abstraction
// TODO(ABurroughs): Trying to avoid raw SQL queries in the UI. But perhaps that's stupid.. 
export interface QueryFilter
{
    get_where_clause() : string;
};

export class IdSetFilter implements QueryFilter
{
    constructor(private ids_       : number[], 
                private including_ : boolean)
    {
    }

    get_where_clause()
    {
        let where_clause = ""
        
        for (let i = 0; i < this.ids_.length; i++)
        {
            if (this.including_)
                where_clause += `id=${this.ids_[i]}`;
            else
                where_clause += `id!=${this.ids_[i]}`

            if (i + 1 < this.ids_.length)
            {
                where_clause += this.including_ ? " OR " : " AND ";
            }
        }
        
        return where_clause;
    }
};

export class ActiveFilter implements QueryFilter
{
    constructor(private is_active_ : boolean)
    {
    }

    get_where_clause()
    {
        if (this.is_active_)
            return `date_closed!=${PackedRecord.NULL_DATE_STR}`;
        else
            return `date_closed=${PackedRecord.NULL_DATE_STR}`;
    }
};

export class WeekFilter implements QueryFilter
{
    constructor(private week_number: number) 
    {
    }

    get_where_clause()
    {
        return `week=${this.week_number}`;
    }
};

export class DayFilter implements QueryFilter
{
    constructor(private day_number: number, private week_number: number)
    {

    }

    get_where_clause()
    {
        return `day=${this.day_number} AND week=${this.week_number}`;
    }
};

export class TypeFilter implements QueryFilter
{
    constructor(private type_ : string, private is_: boolean)
    {
    }

    get_where_clause()
    {
        if (this.is_)
            return `type="${this.type_}"`;
        else
            return `type!="${this.type_}"`;
    }
};

export class ParentFilter implements QueryFilter
{
    constructor(private parent_id_ : number, private is_: boolean)
    {
    }

    get_where_clause()
    {
        if (this.is_)
            return `parent_id=${this.parent_id_}`;
        else
            return `parent_id!=${this.parent_id_}`;
    }
};

export function join_where_clauses_and(filters : QueryFilter[])
{
    let where_clause = "";

    for (let i = 0; i < filters.length; i++)
    {
        if (filters[i].get_where_clause() === "")
            continue;

        if (i > 0)
        {
            where_clause += " AND "
        }

        where_clause += `(${filters[i].get_where_clause()})`
    }

    return where_clause;
}

// Full read/write strategy
@Injectable()
export class DatabaseManager
{
    private static database_: SQLiteObject;
    private static initialized: boolean;

    private static data_updated_callbacks: Map<string, any>;

    constructor(private platform_: Platform, 
                private sqlite_porter_: SQLitePorter, 
                private sqlite_: SQLite,
                private http_: HttpClient)
    {
        if (!DatabaseManager.data_updated_callbacks)
            DatabaseManager.data_updated_callbacks = new Map<string, any>();

        if (DatabaseManager.initialized)
            return;

        this.platform_.ready().then(() => {
            this.sqlite_.create({
              name: 'local.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                DatabaseManager.database_ = db;
                this.seed_database();
                DatabaseManager.initialized = true;
            });
        });
    }
 
    private seed_database() {
        this.http_.get('assets/seed.sql', { responseType: 'text'})
        .subscribe(sql => {
        this.sqlite_porter_.importSqlToDb(DatabaseManager.database_, sql)
            .then(_ => {
                DatabaseManager.execute_data_updated_callbacks();

                // start loop
                CalendarManager.calendar_loop(this);
            })
            .catch(e => console.error(e));
        });
    }

    private static async execute_data_updated_callbacks(no_callbacks?: boolean)
    {
        if (no_callbacks)
            return;
        
        // The compiler wants an array here. Not sure why.
        let callback_array = Array.from(DatabaseManager.data_updated_callbacks.values());
        for (let callback of callback_array)
        {
            callback();
        }
    }

    private executeSqlRows(query_str: string, params?: any[]) : Promise<any>
    {
        return DatabaseManager.database_.executeSql(query_str, params).then(result => {return result.rows});
    }

    // ========================================================================== TGV Packed Helpers
    // Query for list of TVG nodes
    query_packed_tvg_nodes(filters ?: QueryFilter[]) : Promise<PackedRecord.TgvNode[]>
    {
        let where_clause = "";
        
        if (filters)
            where_clause = join_where_clauses_and(filters)

        let query_str = `SELECT * from ${PackedRecord.TGV_TABLE} WHERE ${where_clause}`;
        if (where_clause === "")
        {
            query_str = `SELECT * from ${PackedRecord.TGV_TABLE}`;
        }

        return DatabaseManager.database_.executeSql(query_str, []).then(result => {
            let child_rows : PackedRecord.TgvNode[] = [];
            
            // TODO(ABurroughs): For each?
            if (result.rows.length > 0) {
                for (let i = 0; i < result.rows.length; i++) {
                    let match_row = result.rows.item(i);
                    //child_rows.push(match_row); ??
                    child_rows.push({
                        id : match_row.id,
                        owner: match_row.owner,
                        users: match_row.users,
                        parent_id: match_row.parent_id,
                    
                        type: match_row.type,
                        
                        name: match_row.name,
                        details: match_row.details,
                        date_created: match_row.date_created,
                        date_closed: match_row.date_closed,
                        resolution: match_row.resolution,

                        day: match_row.day,
                        week: match_row.week
                    });
                }
            }

            return child_rows;
        }); 
    }

    insert_packed_tgv_node(node: PackedRecord.TgvNode) : Promise<any>
    {
        let params = [node.owner, node.users, node.parent_id, node.type, node.name, node.details, node.date_created, node.date_closed, node.resolution, node.day, node.week];
        return DatabaseManager.database_.executeSql(`INSERT into ${PackedRecord.TGV_TABLE} VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, params);
    }

    // =================================================================================== Callbacks
    register_data_updated_callback(name: string, callback_function: any)
    {
        DatabaseManager.data_updated_callbacks.set(name, callback_function);
        
        if (DatabaseManager.initialized)
            callback_function();
    }

    unregister_data_updated_callback(name: string)
    {
        DatabaseManager.data_updated_callbacks.delete(name);
    }

    manually_trigger_callbacks()
    {
        DatabaseManager.execute_data_updated_callbacks();
    }

    // ======================================================================================= QUERY
    // ===== General
    query_nodes(filters ?: QueryFilter[]): Promise<InflatedRecord.TgvNode[]>
    {
        return this.query_packed_tvg_nodes(filters).then(InflatedRecord.build_inflated_array);
    }
    
    get_nodes(unique_ids: InflatedRecord.ID[]) : Promise<InflatedRecord.TgvNode[]>
    {
        let id_filter = new IdSetFilter(unique_ids, true);
        return this.query_nodes([id_filter]);
    }

    get_node(unique_id: InflatedRecord.ID) : Promise<InflatedRecord.TgvNode>
    {
        return this.get_nodes([unique_id]).then(nodes => nodes[0]);
    }
    
    // ===== Typedefs
    get_tasks(unique_ids: InflatedRecord.ID[])   : Promise<InflatedRecord.Task[]>   { return this.get_nodes(unique_ids); }
    get_goals(unique_ids: InflatedRecord.ID[])   : Promise<InflatedRecord.Goal[]>   { return this.get_nodes(unique_ids); }
    get_visions(unique_ids: InflatedRecord.ID[]) : Promise<InflatedRecord.Vision[]> { return this.get_nodes(unique_ids); }

    get_task(unique_id: InflatedRecord.ID)   : Promise<InflatedRecord.Task>  { return this.get_node(unique_id); }
    get_goal(unique_id: InflatedRecord.ID)   : Promise<InflatedRecord.Goal>  { return this.get_node(unique_id); }
    get_vision(unique_id: InflatedRecord.ID) : Promise<InflatedRecord.Vision> { return this.get_node(unique_id); }

    query_tasks(filters ?: QueryFilter[]): Promise<InflatedRecord.Task[]>
    {
        let all_filters : QueryFilter[] = [new TypeFilter(PackedRecord.Type.TASK, true)];
        
        if (filters)
        {
            all_filters = all_filters.concat(filters);
        }

        return this.query_nodes(all_filters);
    }
    
    query_goals(filters ?: QueryFilter[]): Promise<InflatedRecord.Goal[]>
    {
        let all_filters : QueryFilter[] = [new TypeFilter(PackedRecord.Type.GOAL, true)];
        
        if (filters)
        {
            all_filters = all_filters.concat(filters);
        }

        return this.query_nodes(all_filters);
    }

    query_visions(filters ?: QueryFilter[]): Promise<InflatedRecord.Vision[]>
    {
        let all_filters : QueryFilter[] = [new TypeFilter(PackedRecord.Type.VISION, true)];
        
        if (filters)
        {
            all_filters = all_filters.concat(filters);
        }

        return this.query_nodes(all_filters);
    }

    // ====================================================================================== Modify
    // ===== General
    private tgv_add(inflated_node : InflatedRecord.TgvNode,
                    no_callbacks?: boolean) : Promise<InflatedRecord.ID>
    {
        let packed_node = new PackedRecord.TgvNode(inflated_node);

        return this.insert_packed_tgv_node(packed_node).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result.insertId; 
        });
    }

    private tgv_remove(unique_id: InflatedRecord.ID,
                       no_callbacks?: boolean) : Promise<any>
    {
        return DatabaseManager.database_.executeSql(`DELETE from ${PackedRecord.TGV_TABLE} where id=?`, [unique_id]).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result;
        });
    }
    
    private tgv_set_basic_attributes(inflated_node : InflatedRecord.TgvNode,
                                     no_callbacks?: boolean) : Promise<any>
    {
        let packed_node = new PackedRecord.TgvNode(inflated_node);
        return DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET name=?, details=?, date_created=?, date_closed=?, resolution=?, day=?, week=? WHERE id=?`, [packed_node.name, packed_node.details, packed_node.date_created, packed_node.date_closed, packed_node.resolution, packed_node.day, packed_node.week, packed_node.id]).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result;
        });
    }

    private tgv_set_parent(unique_id: InflatedRecord.ID,
                           parent_id: InflatedRecord.ID,
                           no_callbacks?: boolean) : Promise<any>
    {
        return DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET parent_id=? WHERE id=?`, [parent_id, unique_id]).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result;
        });
    }

    private tgv_set_children(unique_id: InflatedRecord.ID,
                             child_ids: InflatedRecord.ID[],
                             no_callbacks?: boolean) : Promise<any>
    {
        let where_clause = "";

        for (let i = 0; i < child_ids.length; i++)
        {
            where_clause += `unique_id=${child_ids[i]}`;
            
            if (i + 1 < child_ids.length)
            {
                where_clause += " OR ";
            }
        }

        return DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET parent_id=-1 WHERE parent_id=?`, [unique_id]).then(() => {
            DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET parent_id=? WHERE ?`, [unique_id, where_clause]).then((result) => {
                DatabaseManager.execute_data_updated_callbacks(no_callbacks);
                return result;
            })
        });
    }

    // ===== Typedefs
    // Task
    task_add(inflated_node : InflatedRecord.TgvNode,
             no_callbacks?: boolean) : Promise<InflatedRecord.ID> { return this.tgv_add(inflated_node, no_callbacks); }

    task_remove(unique_id: InflatedRecord.ID,
                no_callbacks?: boolean) : Promise<any> { return this.tgv_remove(unique_id, no_callbacks); }

    task_set_basic_attributes(inflated_node : InflatedRecord.TgvNode,
                              no_callbacks?: boolean) : Promise<any> { return this.tgv_set_basic_attributes(inflated_node, no_callbacks); }

    task_set_parent(unique_id: InflatedRecord.ID,
                    parent_id: InflatedRecord.ID,
                    no_callbacks?: boolean) : Promise<any> { return this.tgv_set_parent(unique_id, parent_id, no_callbacks); }

    // Goal
    goal_add(inflated_node : InflatedRecord.TgvNode,
             no_callbacks?: boolean) : Promise<InflatedRecord.ID> { return this.tgv_add(inflated_node, no_callbacks); }

    goal_remove(unique_id: InflatedRecord.ID,
                no_callbacks?: boolean) : Promise<any> { return this.tgv_remove(unique_id, no_callbacks); }

    goal_set_basic_attributes(inflated_node : InflatedRecord.TgvNode,
                              no_callbacks?: boolean) : Promise<any> { return this.tgv_set_basic_attributes(inflated_node, no_callbacks); }

    goal_set_parent(unique_id: InflatedRecord.ID,
                    parent_id: InflatedRecord.ID,
                    no_callbacks?: boolean) : Promise<any> { return this.tgv_set_parent(unique_id, parent_id, no_callbacks); }

    goal_set_child_ids(unique_id: number,
                       child_ids: number[],
                       no_callbacks?: boolean) : Promise<any> { return this.tgv_set_children(unique_id, child_ids, no_callbacks); }

    // Vision
    vision_add(inflated_node : InflatedRecord.TgvNode,
               no_callbacks?: boolean) : Promise<InflatedRecord.ID> { return this.tgv_add(inflated_node, no_callbacks); }

    vision_remove(unique_id: InflatedRecord.ID,
                  no_callbacks?: boolean) : Promise<any> { return this.tgv_remove(unique_id, no_callbacks); }

    vision_set_basic_attributes(inflated_node : InflatedRecord.TgvNode,
                                no_callbacks?: boolean) : Promise<any> { return this.tgv_set_basic_attributes(inflated_node, no_callbacks); }

    vision_set_child_ids(unique_id: number,
                         child_ids: number[],
                         no_callbacks?: boolean) : Promise<any> { return this.tgv_set_children(unique_id, child_ids, no_callbacks); }
}