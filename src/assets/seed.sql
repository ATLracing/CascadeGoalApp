-- DROP TABLE tgv_nodes_tbl;

CREATE TABLE IF NOT EXISTS tgv_nodes_tbl(id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                         owner TEXT, 
                                         users TEXT,
                                         parent_id INTEGER,
                                         type TEXT,
                                         name TEXT,
                                         details TEXT,
                                         date_created TEXT,
                                         date_closed TEXT,
                                         resolution INTEGER,
                                         day INTEGER,
                                         week INTEGER,
                                         year INTEGER,
                                         day_completed INTEGER,
                                         week_completed INTEGER,
                                         year_completed INTEGER,
                                         abandoned_day_count INTEGER,
                                         abandoned_week_count INTEGER);

-- CREATE TABLE IF NOT EXISTS day_tbl(id INTEGER PRIMARY KEY AUTOINCREMENT,
--                                    previous_id INTEGER,
--                                    week_id INTEGER,
--                                    date TEXT,
--                                    task_ids TEXT);

-- CREATE TABLE IF NOT EXISTS week_tbl(id INTEGER PRIMARY KEY AUTOINCREMENT,
--                                     previous_id INTEGER,
--                                     date TEXT,
--                                     day_ids TEXT,
--                                     task_ids TEXT);

-- INSERT into tgv_nodes_tbl VALUES (NULL, NULL, NULL, NULL, "vision", "First Vision", "Deets", NULL, NULL, 0, 3, 24, 2020, NULL, NULL, NULL, 0, 0);
-- INSERT into tgv_nodes_tbl VALUES (NULL, NULL, NULL, 1, "task", "Task Today", "Deets", NULL, NULL, 0, 3, 24, 2020, NULL, NULL, NULL, 0, 0);
-- INSERT into tgv_nodes_tbl VALUES (NULL, NULL, NULL, 1, "task", "Task Yesterday", "Deets", NULL, NULL, 0, 2, 24, 2020, NULL, NULL, NULL, 0, 0);
-- INSERT into tgv_nodes_tbl VALUES (NULL, NULL, NULL, 1, "task", "Last Week", "Deets", NULL, NULL, 0, NULL, 23, 2020, NULL, NULL, NULL, 0, 0);