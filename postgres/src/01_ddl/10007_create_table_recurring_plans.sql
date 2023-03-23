CREATE TABLE "recurring_plans"
(
  "id"               SERIAL       NOT NULL PRIMARY KEY,
  "day_id"           INTEGER      NOT NULL REFERENCES "day_settings" ("id"),
  "set_id"           INTEGER,
  "title"            VARCHAR(100) NOT NULL, 
  "context"          TEXT,
  "start_time"       VARCHAR(4),
  "end_time"         VARCHAR(4),
  "process_time"     INTEGER,
  "travel_time"      INTEGER,
  "buffer_time"      INTEGER,
  "plan_type"        INTEGER,
  "priority"         INTEGER      NOT NULL,
  "place"            VARCHAR(100)
);
