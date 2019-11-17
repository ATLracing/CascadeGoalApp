import { Week, DatabaseImage, Day } from './database_manager';

// ==================================================================================== EXAMPLE DATA 
// Visions
let example_vision_one = {
    name: "Financial Independence",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: "Quit the 9-5",

    // Implementation
    unique_id: 0,
    child_ids: [0, 1]
};

let example_vision_two = {
    name: "Find Soulmate",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: "Get a honey of a gal",

    // Implementation
    unique_id: 1,
    child_ids: [2]
};

// Goals
let example_goal_one = {
    name: "Get invested",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 0,
    parent_id: 0,
    child_ids: [0, 1]
};

let example_goal_two = {
    name: "Learn Python market API",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 1,
    parent_id: 0,
    child_ids: [2]
};

let example_goal_three = {
    name: "Hit the club",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 2,
    parent_id: 1,
    child_ids: [3, 4]
};

let example_task_one = {
    name: "Create Bitcoin wallet",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 0,
    parent_id: 0,
};

let example_task_two = {
    name: "Create Ethereum wallet",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 1,
    parent_id: 0,
};

let example_task_three = {
    name: "Write basic Python stock price graphing app",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 2,
    parent_id: 1,
};

let example_task_four = {
    name: "Read Yelp club reviews and decide on venue",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 3,
    parent_id: 2,
};

let example_task_five = {
    name: "Buy styling gel",
    date_created: new Date(),
    date_completed: undefined,
    date_cancelled: undefined,

    // Optional data
    details: undefined,

    // Implementation
    unique_id: 4,
    parent_id: 2,
};

let example_day_one : Day = {
    date: new Date(1994, 0),
    task_ids: [0, 1, 2],
    unique_id: 0,
    parent_id: 0,
    last_day_id: undefined
};

let example_week_one : Week = {
    date: new Date(1994, 0),
    task_ids: [0, 1, 4],
    day_ids: [0],
    unique_id: 0,
    last_week_id: undefined
};

export let example_db_image : DatabaseImage = {
    version: 1,
    
    tasks: [example_task_one, example_task_two, example_task_three, example_task_four, example_task_five],
    goals: [example_goal_one, example_goal_two, example_goal_three],
    visions: [example_vision_one, example_vision_two],

    days: [example_day_one],
    weeks: [example_week_one],

    most_recent_day_id: 0,
    next_available_id: 20
};