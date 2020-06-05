import { DatabaseManager, ParentFilter, QueryFilter, IdSetFilter } from './database_manager'
import * as PackedRecord from 'src/app/providers/packed_record';
import * as InflatedRecord from 'src/app/providers/inflated_record'

export class DatabaseInflator
{
    private static async inflate_tgv_node_down(current_node : InflatedRecord.TgvNode,
                                               database_manager: DatabaseManager,
                                               prune_empty_goals: boolean,
                                               task_filters?: QueryFilter[],
                                               goal_filters?: QueryFilter[]) : Promise<InflatedRecord.TgvNode>
    {
        // Tasks cannot be inflated downward
        if (current_node.type == InflatedRecord.Type.TASK)
        {
            return current_node;
        }

        // Find child nodes
        let all_filters : QueryFilter[] = [new ParentFilter(current_node.id, true)];

        if (current_node.type == InflatedRecord.Type.GOAL && task_filters)
        {
            all_filters = all_filters.concat(task_filters);
        }
        else if (current_node.type == InflatedRecord.Type.VISION && goal_filters)
        {
            all_filters = all_filters.concat(goal_filters);
        }

        let child_nodes = await database_manager.query_nodes(all_filters);

        if (prune_empty_goals && 
            current_node.type == InflatedRecord.Type.GOAL && 
            child_nodes.length == 0)
        {
            // Prune the empty non-leaf node
            return undefined;
        }

        // Inflate the child nodes
        current_node.children = [];

        for (let child of child_nodes)
        {
            let inflated_child = await this.inflate_tgv_node_down(child, database_manager, prune_empty_goals, task_filters, goal_filters);
            
            if (!inflated_child)
                continue;

            // Set the inflated node's parent and add it to the tree 
            inflated_child.parent = current_node;
            current_node.children.push(inflated_child);
        }

        return current_node;
    }

    private static async inflate_tgv_node_parent(child_node : InflatedRecord.TgvNode,
                                                 database_manager: DatabaseManager) : Promise<InflatedRecord.TgvNode>
    {
        // Search for parent
        let parent_node_query_res = await database_manager.query_nodes([new IdSetFilter([child_node.parent_id], true)]);

        if (parent_node_query_res.length == 0)
        {
            return undefined;
        }

        // Set parent's parent..
        let parent_node = parent_node_query_res[0];

        parent_node.parent = await DatabaseInflator.inflate_tgv_node_parent(parent_node, database_manager);

        // Set parent's children to current
        parent_node.children = [child_node];

        return parent_node;
    }

    private static async inflate_parent_layer(child_nodes : InflatedRecord.TgvNode[],
                                              level : PackedRecord.Type,
                                              database_manager : DatabaseManager) : Promise<InflatedRecord.TgvNode[]>
    {
        if (child_nodes.length == 0 || child_nodes[0].type == level)
        {
            return child_nodes;
        }

        // Collect all parent IDs (I think it's faster this way, but perhaps it would be better to
        // let the database do its job here..)
        let parent_id_set = new Set<InflatedRecord.ID>();
        
        for (let child_node of child_nodes)
        {
            parent_id_set.add(child_node.parent_id);
        }

        // Query for packed parent nodes
        let id_set_filter = new IdSetFilter(Array.from(parent_id_set), true);

        let parent_nodes = await database_manager.query_nodes([id_set_filter])

        // Add to map and initialize children arrays
        let parent_nodes_map = new Map<InflatedRecord.ID, InflatedRecord.TgvNode>(); // ID -> record

        for (let parent_node of parent_nodes)
        {
            parent_node.children = [];
            parent_nodes_map[parent_node.id] = parent_node;
        }
        
        for (let child_node of child_nodes)
        {
            parent_nodes_map[child_node.parent_id].children.push(child_node);
            let parent_node = parent_nodes_map[child_node.parent_id];   // TODO: get() doesn't work here; no idea why
            child_node.parent = parent_node;
        }

        return await DatabaseInflator.inflate_parent_layer(parent_nodes, level, database_manager);
    }

    // =================================================================================== Interface
    // Simple downward inflation
    static async inflate_task(task : InflatedRecord.Task, database_manager: DatabaseManager) : Promise<InflatedRecord.TgvNode>
    {
        let inflated_task = await DatabaseInflator.inflate_tgv_node_down(task, database_manager, false);
        inflated_task.parent = await this.inflate_tgv_node_parent(inflated_task, database_manager);

        return inflated_task;
    }

    static async inflate_goal(goal : InflatedRecord.Goal, database_manager: DatabaseManager, prune_empty_goals: boolean, task_filters?: QueryFilter[]) : Promise<InflatedRecord.TgvNode>
    {
        let inflated_goal = await DatabaseInflator.inflate_tgv_node_down(goal, database_manager, prune_empty_goals, task_filters);
        if (!inflated_goal)
            return undefined;
        
        inflated_goal.parent = await this.inflate_tgv_node_parent(inflated_goal, database_manager);

        return inflated_goal;
    }

    static async inflate_vision(vision : InflatedRecord.Vision, database_manager: DatabaseManager, prune_empty_goals: boolean, task_filters?: QueryFilter[], goal_filters?:QueryFilter[]) : Promise<InflatedRecord.TgvNode>
    {
        let inflated_vision = await DatabaseInflator.inflate_tgv_node_down(vision, database_manager, prune_empty_goals, task_filters, goal_filters);
        return inflated_vision;
    }

    // Upward min-tree construction
    static async construct_tree_from_tasks(tasks : InflatedRecord.Task[], level : InflatedRecord.Type, database_manager : DatabaseManager) : Promise<InflatedRecord.TgvNode[]>
    {
        // Inflate packed_tasks
        let inflated_tasks : InflatedRecord.TgvNode[] = [];

        for (let task of tasks)
        {
            inflated_tasks.push(task);
        }

        return DatabaseInflator.inflate_parent_layer(inflated_tasks, level, database_manager);
    }
}