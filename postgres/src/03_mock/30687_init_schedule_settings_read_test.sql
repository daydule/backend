INSERT INTO "users" 
(
  "id",
  "nickname",
  "email",
  "hashed_password",
  "salt",
  "is_guest"
)
VALUES
(
  306871,
  'test306871',
  'test306871@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false
);

INSERT INTO "day_settings" 
(
  "id",
  "user_id",
  "setting_name",    
  "day",
  "schedule_start_time",
  "schedule_end_time",
  "scheduling_logic"
)
VALUES
(
  306870,
  306871,
  '日曜日',
  0,
  '1000',
  '1900',
  0
),
(
  306871,
  306871,
  '月曜日',
  1,
  '1000',
  '1900',
  0
),
(
  306872,
  306871,
  '火曜日',
  2,
  '1000',
  '1900',
  0
),
(
  306873,
  306871,
  '水曜日',
  3,
  '1000',
  '1900',
  0
),
(
  306874,
  306871,
  '木曜日',
  4,
  '1000',
  '1900',
  0
),
(
  306875,
  306871,
  '金曜日',
  5,
  '1000',
  '1900',
  0
),
(
  306876,
  306871,
  '土曜日',
  6,
  '1000',
  '1900',
  0
);

INSERT INTO "recurring_plans" 
(
  "id",
  "day_id",
  "set_id",
  "title", 
  "context",
  "start_time",
  "end_time",
  "process_time",
  "travel_time",
  "buffer_time",
  "plan_type",
  "priority",
  "place"
)
VALUES
(
  306870,
  306870,
  null,
  '固定予定306870',
  null,
  '1000',
  '1200',
  120,
  15,
  15,
  1,
  5,
  null
),
(
  306871,
  306870,
  null,
  '固定予定306871',
  null,
  '1000',
  '1200',
  120,
  15,
  15,
  1,
  5,
  null
),
(
  306872,
  306872,
  null,
  '固定予定306872',
  null,
  '1000',
  '1200',
  120,
  15,
  15,
  1,
  5,
  null
);
