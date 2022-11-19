CREATE TABLE "schedule_plan_inclusion"
(
  "id"               SERIAL       NOT NULL PRIMARY KEY,
  "plan_id"          INTEGER      NOT NULL REFERENCES "plans" ("id"),
  "schedule_id"      INTEGER      NOT NULL REFERENCES "schedules" ("id")
);
