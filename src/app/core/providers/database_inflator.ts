import { DatabaseManager, ParentFilter, QueryFilter, IdSetFilter, TypeFilter, join_and } from './database_manager'
import * as PackedRecord from 'src/app/core/providers/packed_record';
import * as InflatedRecord from 'src/app/core/providers/inflated_record'

export class DatabaseInflator
{
    private static async inflate_tgv_node_down(current_node : InflatedRecord.TgvNode,
                                               database_manager: DatabaseManager,
                                               prune_empty_goals: boolean,
                                               task_filter?: QueryFilter,
                                               goal_filter?: QueryFilter) : Promise<InflatedRecord.TgvNode>
    {
        // Tasks cannot be inflated downward
        if (current_node.type == InflatedRecord.Type.TASK)
        {
            return current_node;
        }

        // Find child nodes (only search layer directly beneath)
        let child_filter : QueryFilter = join_and(new ParentFilter(current_node.id, true), new TypeFilter(current_node.type - 1, true));

        if (current_node.type == InflatedRecord.Type.GOAL && task_filter)
        {
            child_filter = join_and(child_filter, task_filter);
        }
        else if (current_node.type == InflatedRecord.Type.VISION && goal_filter)
        {
            child_filter = join_and(child_filter, goal_filter);
        }

        let child_nodes = await database_manager.query_nodes(child_filter);

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
            let inflated_child = await this.inflate_tgv_node_down(child, database_manager, prune_empty_goals, task_filter, goal_filter);
            
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
        let parent_node_query_res = await database_manager.query_nodes(new IdSetFilter([child_node.parent_id], true));

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

        let parent_nodes = await database_manager.query_nodes(id_set_filter)

        // Add to map and initialize children arrays
        let parent_nodes_map = new Map<InflatedRecord.ID, InflatedRecord.TgvNode>(); // ID -> record

        for (let parent_node of parent_nodes)
        {
            parent_node.children = [];
            parent_nodes_map[parent_node.id] = parent_node;
        }
        
        for (let child_node of child_nodes)
        {
            let parent_node = parent_nodes_map[child_node.parent_id];   // TODO: get() doesn't work here; no idea why
            parent_node.children.push(child_node);
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

    static async inflate_goal(goal : InflatedRecord.Goal, database_manager: DatabaseManager, prune_empty_goals: boolean, task_filter?: QueryFilter) : Promise<InflatedRecord.TgvNode>
    {
        let inflated_goal = await DatabaseInflator.inflate_tgv_node_down(goal, database_manager, prune_empty_goals, task_filter);
        if (!inflated_goal)
            return undefined;
        
        inflated_goal.parent = await this.inflate_tgv_node_parent(inflated_goal, database_manager);

        return inflated_goal;
    }

    static async inflate_vision(vision : InflatedRecord.Vision, database_manager: DatabaseManager, prune_empty_goals: boolean, task_filter?: QueryFilter, goal_filter?: QueryFilter) : Promise<InflatedRecord.TgvNode>
    {
        let inflated_vision = await DatabaseInflator.inflate_tgv_node_down(vision, database_manager, prune_empty_goals, task_filter, goal_filter);
        return inflated_vision;
    }

    // Upward min-tree construction
    static async upward_inflate(nodes : InflatedRecord.TgvNode[], database_manager : DatabaseManager)
    {
        let parent_id_map = new Map<InflatedRecord.ID, InflatedRecord.TgvNode[]>(); // Parent ID -> Child

        for (let node of nodes)
        {
            if (node.parent_id)
            {
                if (!parent_id_map.has(node.parent_id))
                {
                    parent_id_map.set(node.parent_id, [node]);
                }
                else
                {
                    let children = parent_id_map.get(node.parent_id);
                    children.push(node);
                    parent_id_map.set(node.parent_id, children);
                }
            }
        }

        let query_ids = Array.from(parent_id_map.keys());

        if (query_ids.length > 0)
        {
            let parent_nodes = await database_manager.query_nodes(new IdSetFilter(query_ids, true));
            await this.upward_inflate(parent_nodes, database_manager);

            for (let parent of parent_nodes)
            {
                parent.children = parent_id_map.get(parent.id);
                
                for (let child of parent.children)
                {
                    child.parent = parent;
                }
            }
        }
    }
}