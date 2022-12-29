CREATE TABLE "temporary_plans"
(
  "id"               SERIAL              NOT NULL PRIMARY KEY,
  "original_plan_id" INTEGER      UNIQUE NOT NULL REFERENCES "plans" ("id"),
  "user_id"          INTEGER             NOT NULL REFERENCES "users" ("id"),
  "title"            VARCHAR(100)        NOT NULL, 
  "context"          TEXT,
  "date"             DATE,
  "start_time"       VARCHAR(4),
  "end_time"         VARCHAR(4),
  "process_time"     INTEGER,
  "travel_time"      INTEGER,
  "buffer_time"      INTEGER,
  "plan_type"        INTEGER,
  "priority"         INTEGER             NOT NULL,
  "place"            VARCHAR(100),
  "todo_start_time"  TIMESTAMP
);
