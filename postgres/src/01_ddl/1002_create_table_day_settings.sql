CREATE TABLE "day_settings"
(
  "id"                  SERIAL      NOT NULL PRIMARY KEY,
  "user_id"             INT         NOT NULL REFERENCES "users" ("id"),
  "setting_name"        VARCHAR(20) NOT NULL,
  "day"                 INT         NOT NULL,
  "schedule_start_time" VARCHAR(4)  NOT NULL,
  "schedule_end_time"   VARCHAR(4)  NOT NULL,
  "scheduling_logic"    INT         NOT NULL
);
