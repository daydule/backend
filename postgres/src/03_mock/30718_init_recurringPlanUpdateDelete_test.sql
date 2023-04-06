INSERT INTO "users" 
(
  "id",
  "nickname",
  "email",
  "hashed_password",
  "salt",
  "is_guest",
  "todo_orders_for_list",
  "todo_orders_for_schedule"
)
VALUES
(
  307181,
  'test307181',
  'test307181@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  '',
  ''
);

INSERT INTO "day_settings" (
  "id",
  "user_id",
  "setting_name",
  "day",
  "schedule_start_time",
  "schedule_end_time",
  "scheduling_logic"
) VALUES (
  307181,
  307181,
  '日曜日',
  0,
  '1000',
  '1900',
  0
),
(
  307182,
  307181,
  '月曜日',
  1,
  '1000',
  '1900',
  0
),(
  307183,
  307181,
  '火曜日',
  2,
  '1000',
  '1900',
  0
),(
  307184,
  307181,
  '水曜日',
  3,
  '1000',
  '1900',
  0
),(
  307185,
  307181,
  '木曜日',
  4,
  '1000',
  '1900',
  0
),(
  307186,
  307181,
  '金曜日',
  5,
  '1000',
  '1900',
  0
),(
  307187,
  307181,
  '土曜日',
  6,
  '1000',
  '1900',
  0
);


INSERT INTO "recurring_plans" (
  "id",
  "day_id",
  "set_id",
  "title", 
  "context",
  "start_time",
  "end_time",
  "travel_time",
  "buffer_time",
  "priority",
  "place"
) VALUES (
  307181,
  307181,
  307181,
  '繰り返し予定307181',
  null,
  '1000',
  '1200',
  15,
  15,
  5,
  null
),(
  307182,
  307182,
  307181,
  '繰り返し予定307182',
  null,
  '1000',
  '1200',
  15,
  15,
  5,
  null
), (
  307183,
  307186,
  307183,
  '繰り返し予定307183',
  null,
  '1000',
  '1200',
  15,
  15,
  5,
  null
),(
  307184,
  307187,
  307183,
  '繰り返し予定307184',
  null,
  '1000',
  '1200',
  15,
  15,
  5,
  null
);

