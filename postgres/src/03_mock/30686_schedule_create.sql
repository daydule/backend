INSERT INTO "users" 
(
  "id",
  "nickname",
  "email",
  "hashed_password",
  "salt",
  "is_guest",
  "todo_list_order",
  "scheduled_todo_order"
)
VALUES
(
  -- 予定・TODOあり
  306861,
  'test306861',
  'test306861@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  '306862,306863',
  ''
), 
(
  -- 予定あり・TODOなし
  306862,
  'test306862',
  'test306862@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  '',
  ''
),
(
  -- 予定なし・TODOあり
  306863,
  'test306863',
  'test306863@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  '306865',
  ''
);

INSERT INTO "schedules" 
(
  "id",
  "user_id",
  "date",
  "start_time",
  "end_time",
  "is_created"
)
VALUES
(
  306861,
  306861,
  '2022-12-12',
  '0900',
  '1800',
  false
),
(
  306862,
  306862,
  '2022-12-12',
  '0900',
  '1800',
  false
),
(
  306863,
  306863,
  '2022-12-12',
  '0900',
  '1800',
  false
);

INSERT INTO "plans" 
(
  "id",
  "user_id",
  "title",
  "context",
  "date",
  "start_time",
  "end_time",
  "process_time",
  "travel_time",
  "buffer_time",
  "plan_type",
  "priority",
  "place",
  "is_scheduled",
  "is_required_plan",
  "parent_plan_id",
  "is_parent_plan"
)
VALUES
(
  -- 予定
  306861,
  306861,
  '予定306861',
  '説明306861',
  '2022-12-12',
  '1000',
  '1700',
  120,
  15,
  15,
  0,
  5,
  '会議室306861',
  true,
  true,
  null,
  false
),
(
  -- TODO(dateがnull)
  306862,
  306861,
  '予定306862',
  '説明306862',
  null,
  '0900',
  '1100',
  10,
  15,
  15,
  1,
  5,
  '会議室306862',
  false,
  true,
  null,
  false
),
(
  -- TODO(dateがnull)
  306863,
  306861,
  '予定306863',
  '説明306863',
  null,
  '0900',
  '1100',
  110,
  15,
  15,
  1,
  5,
  '会議室306863',
  false,
  true,
  null,
  false
),
(
  -- 予定
  306864,
  306862,
  '予定306864',
  '説明306864',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  0,
  5,
  '会議室306864',
  true,
  true,
  null,
  false
),
(
  -- TODO(dateがnull)
  306865,
  306863,
  '予定306865',
  '説明306865',
  null,
  '0900',
  '1100',
  120,
  15,
  15,
  1,
  5,
  '会議室306865',
  false,
  true,
  null,
  false
);
