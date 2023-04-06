CREATE TABLE "users"
(
  "id"                       SERIAL      NOT NULL PRIMARY KEY,
  "nickname"                 VARCHAR(20),
  "email"                    VARCHAR(64) NOT NULL,
  "hashed_password"          VARCHAR(64) NOT NULL,
  "salt"                     VARCHAR(32) NOT NULL,
  "is_guest"                 BOOLEAN     NOT NULL,
  "todo_list_order"     TEXT        NOT NULL,
  "scheduled_todo_order" TEXT        NOT NULL
);
