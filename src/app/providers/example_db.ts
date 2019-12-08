import { DatabaseImage } from './database_manager';
import { getLocaleId } from '@angular/common';
import * as PackedRecord from './packed_record';

// ==================================================================================== EXAMPLE DATA 
// Visions
let example_vision_one : PackedRecord.Vision = {
    name: "Financial Independence",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: "Quit the 9-5",

    // Implementation
    unique_id: new PackedRecord.VisionID(0, PackedRecord.GROUP_LOCAL),
    child_ids: [new PackedRecord.GoalID(0, PackedRecord.GROUP_LOCAL), new PackedRecord.GoalID(1, PackedRecord.GROUP_LOCAL)]
};

let example_vision_two : PackedRecord.Vision = {
    name: "Find Soulmate",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: "Get a honey of a gal",

    // Implementation
    unique_id: new PackedRecord.VisionID(1, PackedRecord.GROUP_LOCAL),
    child_ids: [new PackedRecord.GoalID(2, PackedRecord.GROUP_LOCAL)]
};

// Goals
let example_goal_one : PackedRecord.Goal = {
    name: "Get invested",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.GoalID(0, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.VisionID(0, PackedRecord.GROUP_LOCAL),
    child_ids: [new PackedRecord.TaskID(0, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(1, PackedRecord.GROUP_LOCAL)]
};

let example_goal_two : PackedRecord.Goal = {
    name: "Learn Python market API",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.GoalID(1, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.VisionID(0, PackedRecord.GROUP_LOCAL),
    child_ids: [new PackedRecord.TaskID(2, PackedRecord.GROUP_LOCAL)]
};

let example_goal_three : PackedRecord.Goal = {
    name: "Hit the club",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.GoalID(2, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.VisionID(1, PackedRecord.GROUP_LOCAL),
    child_ids: [new PackedRecord.TaskID(3, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(4, PackedRecord.GROUP_LOCAL)]
};

let example_task_one : PackedRecord.Task = {
    name: "Create Bitcoin wallet",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.TaskID(0, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.GoalID(0, PackedRecord.GROUP_LOCAL),
};

let example_task_two : PackedRecord.Task = {
    name: "Create Ethereum wallet",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.TaskID(1, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.GoalID(0, PackedRecord.GROUP_LOCAL),
};

let example_task_three : PackedRecord.Task = {
    name: "Write basic Python stock price graphing app",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.TaskID(2, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.GoalID(1, PackedRecord.GROUP_LOCAL),
};

let example_task_four : PackedRecord.Task = {
    name: "Read Yelp club reviews and decide on venue",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.TaskID(3, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.GoalID(2, PackedRecord.GROUP_LOCAL),
};

let example_task_five : PackedRecord.Task = {
    name: "Buy styling gel",
    date_created: new Date(),
    date_completed: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: new PackedRecord.TaskID(4, PackedRecord.GROUP_LOCAL),
    parent_id: new PackedRecord.GoalID(2, PackedRecord.GROUP_LOCAL),
};

let example_day_one : PackedRecord.Day = {
    date: new Date(1994, 0),
    task_ids: [new PackedRecord.TaskID(0, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(1, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(2, PackedRecord.GROUP_LOCAL)],
    unique_id: new PackedRecord.DayID(0, PackedRecord.GROUP_LOCAL),
    week_id: new PackedRecord.WeekID(0, PackedRecord.GROUP_LOCAL),
    previous_id: undefined
};

let example_week_one : PackedRecord.Week = {
    date: new Date(1994, 0),
    task_ids: [new PackedRecord.TaskID(0, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(1, PackedRecord.GROUP_LOCAL), new PackedRecord.TaskID(4, PackedRecord.GROUP_LOCAL)],
    day_ids: [new PackedRecord.DayID(0, PackedRecord.GROUP_LOCAL),],
    unique_id: new PackedRecord.WeekID(0, PackedRecord.GROUP_LOCAL),
    previous_id: undefined
};

export let example_db_image : DatabaseImage = {
    version: 1,
    
    tasks: [example_task_one, example_task_two, example_task_three, example_task_four, example_task_five],
    goals: [example_goal_one, example_goal_two, example_goal_three],
    visions: [example_vision_one, example_vision_two],

    days: [example_day_one],
    weeks: [example_week_one],

    most_recent_day_id: new PackedRecord.DayID(0, PackedRecord.GROUP_LOCAL),
    most_recent_week_id: new PackedRecord.WeekID(0, PackedRecord.GROUP_LOCAL),
    next_available_index: 20
};