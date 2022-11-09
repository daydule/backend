CREATE TABLE "users"
(
  "id"        SERIAL      NOT NULL PRIMARY KEY,
  "user_name" VARCHAR(20),
  "email"     VARCHAR(64) NOT NULL,
  "password"  VARCHAR(64) NOT NULL,
  "salt"      VARCHAR(32) NOT NULL,
  "is_guest"  BOOLEAN     NOT NULL
);
