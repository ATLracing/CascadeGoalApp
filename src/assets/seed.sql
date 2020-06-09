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
                                         year INTEGER);

CREATE TABLE IF NOT EXISTS day_tbl(id INTEGER PRIMARY KEY AUTOINCREMENT,
                                   previous_id INTEGER,
                                   week_id INTEGER,
                                   date TEXT,
                                   task_ids TEXT);

CREATE TABLE IF NOT EXISTS week_tbl(id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    previous_id INTEGER,
                                    date TEXT,
                                    day_ids TEXT,
                                    task_ids TEXT);