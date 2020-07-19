import { Injectable } from '@angular/core';
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record';
import { Platform } from '@ionic/angular';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { HttpClient } from '@angular/common/http';
import { DiscreteDate, DiscreteDateLevel } from './discrete_date';

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
        let where_clause = (this.including_ ? "" : "NOT ") + "id IN (";
        
        for (let i = 0; i < this.ids_.length; i++)
        {
            where_clause += this.ids_[i];

            if (i + 1 < this.ids_.length) 
                where_clause += ", ";
        }
        
        return where_clause + ")";
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
            return `date_closed IS NULL`;
        else
            return `date_closed IS NOT NULL`;
    }
};

export class TypeFilter implements QueryFilter
{
    constructor(private type_ : InflatedRecord.Type, private is_: boolean)
    {
    }

    get_where_clause()
    {
        let type_str = PackedRecord.inflated_to_packed_type(this.type_);
        if (this.is_)
            return `type="${type_str}"`;
        else
            return `type!="${type_str}"`;
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

export class DateContainsFilter implements QueryFilter
{
    constructor(private date: DiscreteDate) 
    {
    }

    get_where_clause()
    {
        let where_clause = "";

        if (this.date.year != null)
        {
            where_clause += `year=${this.date.year}`;
        }
        if (this.date.week != null)
        {
            where_clause += ` AND week=${this.date.week}`;
        }
        if (this.date.day != null)
        {
            where_clause += ` AND day=${this.date.day}`;
        }

        return where_clause;
    }
};

export class ScheduledFilter implements QueryFilter
{
    constructor() 
    {
    }

    get_where_clause()
    {
        return "year IS NOT NULL OR week IS NOT NULL OR day IS NOT NULL";
    }
}

export class DateCompletedContainsFilter implements QueryFilter
{
    constructor(private date: DiscreteDate) 
    {
    }

    get_where_clause()
    {
        let where_clause = "";

        if (this.date.year != null)
        {
            where_clause += `year_completed=${this.date.year}`;
        }
        if (this.date.week != null)
        {
            where_clause += ` AND week_completed=${this.date.week}`;
        }
        if (this.date.day != null)
        {
            where_clause += ` AND day_completed=${this.date.day}`;
        }

        return where_clause;
    }
};

export class DatePriorFilter implements QueryFilter
{
    constructor(private date: DiscreteDate) 
    {
    }

    get_where_clause()
    {
        let where_clause = "";

        if (this.date.year != null)
        {
            where_clause += `year<${this.date.year}`;
        }
        if (this.date.week != null)
        {
            where_clause += ` OR year=${this.date.year} AND week<${this.date.week}`;
        }
        if (this.date.day != null)
        {
            where_clause += ` OR year=${this.date.year} AND week=${this.date.week} AND day<${this.date.day}`;
        }

        return where_clause;
    }
};

export class DateCompletedPriorFilter implements QueryFilter
{
    constructor(private date: DiscreteDate) 
    {
    }

    get_where_clause()
    {
        let where_clause = "";

        if (this.date.year != null)
        {
            where_clause += `year_completed<${this.date.year}`;
        }
        if (this.date.week != null)
        {
            where_clause += ` OR year_completed=${this.date.year} AND week_completed<${this.date.week}`;
        }
        if (this.date.day != null)
        {
            where_clause += ` OR year_completed=${this.date.year} AND week_completed=${this.date.week} AND day_completed<${this.date.day}`;
        }

        return where_clause;
    }
};

export class DateLevelFilter implements QueryFilter
{
    constructor(private level_: DiscreteDateLevel) 
    {
    }

    get_where_clause()
    {
        if (this.level_ == DiscreteDateLevel.DAY)
            return 'day IS NOT NULL';
        if (this.level_ == DiscreteDateLevel.WEEK)
            return 'week IS NOT NULL';
        if (this.level_ == DiscreteDateLevel.YEAR)
            return 'year IS NOT NULL';
    }
};

export class CustomFilter implements QueryFilter
{
    constructor(private where_clause_: string)
    {
    }

    get_where_clause()
    {
        return this.where_clause_;
    }
};

export class OrFilter implements QueryFilter
{
    constructor(private lhs_: QueryFilter, private rhs_: QueryFilter)
    {
    }

    get_where_clause()
    {
        return `(${this.lhs_.get_where_clause()}) OR (${this.rhs_.get_where_clause()})`;
    }
};

export class AndFilter implements QueryFilter
{
    constructor(private lhs_: QueryFilter, private rhs_: QueryFilter)
    {
    }

    get_where_clause()
    {
        return `(${this.lhs_.get_where_clause()}) AND (${this.rhs_.get_where_clause()})`;
    }
};

export class NotFilter implements QueryFilter
{
    constructor(private filter_: QueryFilter)
    {
    }

    get_where_clause()
    {
        return `NOT (${this.filter_.get_where_clause()})`;
    }
};

export function join_and(...filters: QueryFilter[])
{
    if (filters.length == 1)
        return filters[0];

    let root_filter = new AndFilter(filters[0], filters[1]);

    for (let i = 2; i < filters.length; i++)
    {
        root_filter = new AndFilter(filters[i], root_filter);
    }

    return root_filter;
}

export function join_or(...filters: QueryFilter[])
{
    if (filters.length == 1)
        return filters[0];

    let root_filter = new OrFilter(filters[0], filters[1]);

    for (let i = 2; i < filters.length; i++)
    {
        root_filter = new OrFilter(filters[i], root_filter);
    }

    return root_filter;
}

// Full read/write strategy
@Injectable()
export class DatabaseManager
{
    private static database_: SQLiteObject;
    private static initialized: boolean;
    private static initialization_pending_: boolean;

    private static data_updated_callbacks: Map<string, any>;

    constructor(private platform_: Platform, 
                private sqlite_porter_: SQLitePorter, 
                private sqlite_: SQLite,
                private http_: HttpClient)
    {
        if (!DatabaseManager.data_updated_callbacks)
            DatabaseManager.data_updated_callbacks = new Map<string, any>();

        if (DatabaseManager.initialized || DatabaseManager.initialization_pending_)
            return;

        DatabaseManager.initialization_pending_ = true;

        this.platform_.ready().then(() => {
            this.sqlite_.create({
              name: 'local.db',
              location: 'default'
            })
            .then((db: SQLiteObject) => {
                DatabaseManager.database_ = db;
                this.seed_database();
            });
        });
    }
 
    private seed_database() {
        this.http_.get('assets/seed.sql', { responseType: 'text'})
        .subscribe(sql => {
        this.sqlite_porter_.importSqlToDb(DatabaseManager.database_, sql)
            .then(_ => {
                console.log("Database Initialized!");
                DatabaseManager.initialized = true;
                DatabaseManager.execute_data_updated_callbacks();
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
    query_packed_tvg_nodes(filter ?: QueryFilter) : Promise<PackedRecord.TgvNode[]>
    {
        if (!DatabaseManager.database_)
            return new Promise<PackedRecord.TgvNode[]>(() => { return []});
        
        let query_str = `SELECT * from ${PackedRecord.TGV_TABLE}`;
        
        if (filter)
            query_str = `${query_str} WHERE ${filter.get_where_clause()}`;
        
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
                        week: match_row.week,
                        year: match_row.year,

                        day_completed: match_row.day_completed,
                        week_completed: match_row.week_completed,
                        year_completed: match_row.year_completed,

                        abandoned_day_count: match_row.abandoned_day_count,
                        abandoned_week_count: match_row.abandoned_week_count
                    });
                }
            }

            return child_rows;
        }); 
    }

    insert_packed_tgv_node(node: PackedRecord.TgvNode) : Promise<any>
    {
        let params = [node.owner, node.users, node.parent_id, node.type, node.name, node.details, node.date_created, node.date_closed, node.resolution, node.day, node.week, node.year, node.day_completed, node.week_completed, node.year_completed, node.abandoned_day_count, node.abandoned_week_count];
        return DatabaseManager.database_.executeSql(`INSERT into ${PackedRecord.TGV_TABLE} VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, params);
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
    query_nodes(filter ?: QueryFilter): Promise<InflatedRecord.TgvNode[]>
    {
        return this.query_packed_tvg_nodes(filter).then(InflatedRecord.build_inflated_array);
    }
    
    get_nodes(unique_ids: InflatedRecord.ID[]) : Promise<InflatedRecord.TgvNode[]>
    {
        let id_filter = new IdSetFilter(unique_ids, true);
        return this.query_nodes(id_filter);
    }

    get_node(unique_id: InflatedRecord.ID) : Promise<InflatedRecord.TgvNode>
    {
        return this.get_nodes([unique_id]).then(nodes => nodes[0]);
    }
    
    // ===== Typedefs
    get_tasks(unique_ids: InflatedRecord.ID[])   : Promise<InflatedRecord.Task[]>   { return this.get_nodes(unique_ids); }
    get_goals(unique_ids: InflatedRecord.ID[])   : Promise<InflatedRecord.Goal[]>   { return this.get_nodes(unique_ids); }
    get_visions(unique_ids: InflatedRecord.ID[]) : Promise<InflatedRecord.Vision[]> { return this.get_nodes(unique_ids); }

    get_task(unique_id: InflatedRecord.ID)   : Promise<InflatedRecord.Task>   { return this.get_node(unique_id); }
    get_goal(unique_id: InflatedRecord.ID)   : Promise<InflatedRecord.Goal>   { return this.get_node(unique_id); }
    get_vision(unique_id: InflatedRecord.ID) : Promise<InflatedRecord.Vision> { return this.get_node(unique_id); }

    query_tasks(filter ?: QueryFilter): Promise<InflatedRecord.Task[]>
    {
        let type_filter : QueryFilter = new TypeFilter(InflatedRecord.Type.TASK, true);
        
        if (filter)
        {
            type_filter = join_and(type_filter, filter)
        }

        return this.query_nodes(type_filter);
    }
    
    query_goals(filter ?: QueryFilter): Promise<InflatedRecord.Goal[]>
    {
        let type_filter : QueryFilter = new TypeFilter(InflatedRecord.Type.GOAL, true);
        
        if (filter)
        {
            type_filter = join_and(type_filter, filter)
        }

        return this.query_nodes(type_filter);
    }

    query_visions(filter ?: QueryFilter): Promise<InflatedRecord.Vision[]>
    {
        let type_filter : QueryFilter = new TypeFilter(InflatedRecord.Type.VISION, true);
        
        if (filter)
        {
            type_filter = join_and(type_filter, filter)
        }

        return this.query_nodes(type_filter);
    }

    // ====================================================================================== Modify
    // ===== General
    tgv_add(inflated_node : InflatedRecord.TgvNode,
            no_callbacks?: boolean) : Promise<InflatedRecord.ID>
    {
        let packed_node = new PackedRecord.TgvNode(inflated_node);

        return this.insert_packed_tgv_node(packed_node).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result.insertId; 
        });
    }

    async tgv_remove(inflated_node : InflatedRecord.TgvNode,
                     no_callbacks?: boolean) : Promise<any>
    {
        // TODO(ABurroughs): This should assign orphaned tasks of vision-associated goals to the
        // associated vision.
        // Clear parents of child nodes
        if (inflated_node.type != InflatedRecord.Type.TASK)
        {
            let children = await this.query_nodes(new ParentFilter(inflated_node.id, true));
            let child_ids = [];
            for (let child of children) { child_ids.push(child.id); }

            if (child_ids.length > 0)
            {
                let id_set_filter = new IdSetFilter(child_ids, true);
                await DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET parent_id=NULL WHERE ${id_set_filter.get_where_clause()}`, []);
            }
        }

        return DatabaseManager.database_.executeSql(`DELETE from ${PackedRecord.TGV_TABLE} where id=?`, [inflated_node.id]).then(result => {
            DatabaseManager.execute_data_updated_callbacks(no_callbacks);
            return result;
        });
    }
    
    tgv_set_basic_attributes(inflated_node : InflatedRecord.TgvNode,
                             no_callbacks?: boolean) : Promise<any>
    {
        let packed_node = new PackedRecord.TgvNode(inflated_node);
        return DatabaseManager.database_.executeSql(`UPDATE ${PackedRecord.TGV_TABLE} SET parent_id=?, name=?, details=?, date_created=?, date_closed=?, resolution=?, day=?, week=?, year=?, day_completed=?, week_completed=?, year_completed=?, abandoned_day_count=?, abandoned_week_count=? WHERE id=?`, [packed_node.parent_id, packed_node.name, packed_node.details, packed_node.date_created, packed_node.date_closed, packed_node.resolution, packed_node.day, packed_node.week, packed_node.year, packed_node.day_completed, packed_node.week_completed, packed_node.year_completed, packed_node.abandoned_day_count, packed_node.abandoned_week_count, packed_node.id]).then(result => {
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
}