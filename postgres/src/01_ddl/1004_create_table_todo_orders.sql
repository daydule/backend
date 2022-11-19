CREATE TABLE "todo_orders"
(
  "id"                  SERIAL      NOT NULL PRIMARY KEY,
  "user_id"             INTEGER     NOT NULL REFERENCES "users" ("id"),
  "schedule_id"         INTEGER     REFERENCES "schedules" ("id"),
  "todo_orders"         TEXT        NOT NULL
);
