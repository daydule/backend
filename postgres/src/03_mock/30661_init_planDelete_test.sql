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
  306611,
  'test306611',
  'test306611@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  '',
  ''
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
  306611,
  306611,
  '予定1',
  '説明1',
  '2023-1-11',
  '0900',
  '1100',
  120,
  0,
  0,
  0,
  5,
  '会議室1',
  true,
  true,
  null,
  false
);