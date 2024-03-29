CREATE TABLE "schedules"
(
  "id"                      SERIAL             NOT NULL PRIMARY KEY,
  "user_id"                 INT                NOT NULL REFERENCES "users" ("id"),
  "date"                    DATE               NOT NULL,
  "start_time"              VARCHAR(4)         NOT NULL DEFAULT '0900',
  "end_time"                VARCHAR(4)         NOT NULL DEFAULT '1800',
  "is_created"              BOOLEAN            NOT NULL DEFAULT FALSE
);