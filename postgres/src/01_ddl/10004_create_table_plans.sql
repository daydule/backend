CREATE TABLE "plans"
(
  "id"               SERIAL       NOT NULL PRIMARY KEY,
  "user_id"          INTEGER      NOT NULL REFERENCES "users" ("id"),
  "title"            VARCHAR(100) NOT NULL, 
  "context"          TEXT,
  "date"             DATE,
  "start_time"       VARCHAR(4),
  "end_time"         VARCHAR(4),
  "process_time"     INTEGER,
  "travel_time"      INTEGER,
  "buffer_time"      INTEGER,
  "plan_type"        INTEGER,
  "priority"         INTEGER      NOT NULL,
  "place"            VARCHAR(100),
  "is_scheduled"     BOOLEAN      DEFAULT FALSE,
  "is_required_plan" BOOLEAN      DEFAULT TRUE,
  "parent_plan_id"   INTEGER,
  "is_parent_plan"   BOOLEAN      DEFAULT FALSE
);
