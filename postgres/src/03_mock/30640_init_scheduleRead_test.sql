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
  -- スケジュールレコードあり＆スケジュール済み＆予定（分割なし、分割あり）・仮予定・TODO（日付なし、日付あり）あり
  306401,
  'test306401',
  'test306401@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false
),
(
  -- スケジュールレコードあり＆スケジュール未作成
  306402,
  'test306402',
  'test306402@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false
),
(
  -- スケジュールレコードなし＆ゲスト
  306403,
  'test306403',
  'test306403@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  true
),
(
  -- スケジュールレコードなし＆曜日設定レコードあり&繰り返し予定あり
  306404,
  'test306404',
  'test306404@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false
),
(
  -- スケジュールレコードなし＆曜日設定レコードなし＆予定・TODOあり
  306405,
  'test306405',
  'test306405@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false
);

INSERT INTO "schedules" 
(
  "id",
  "user_id",
  "date",
  "start_time",
  "end_time",
  "start_time_at_schedule",
  "end_time_at_schedule",
  "is_created"
)
VALUES
(
  306401,
  306401,
  '2022-12-12',
  '0900',
  '1800',
  '1000',
  '1900',
  true
),
(
  306402,
  306402,
  '2022-12-12',
  '0900',
  '1800',
  '1000',
  '1900',
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
  306404,
  306404,
  '月曜日',
  1,
  '1000',
  '1900',
  0
),
(
  306405,
  306405,
  '月曜日',
  1,
  '1000',
  '1900',
  0
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
  "is_parent_plan",
  "todo_start_time"
)
VALUES
(
  -- 予定
  3064011,
  306401,
  '予定306401-1',
  '説明306401-1',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  0,
  5,
  '会議室306401-1',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO(dateがnull)
  3064012,
  306401,
  '予定306401-2',
  '説明306401-2',
  null,
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306401-2',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO(dateが2022-12-12)
  3064013,
  306401,
  '予定306401-3',
  '説明306401-3',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306401-3',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO(dateが2022-12-13)
  3064014,
  306401,
  '予定306401-4',
  '説明306401-4',
  '2022-12-13',
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306401-4',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO(分割後のTODO)
  3064015,
  306401,
  '予定306401-5',
  '説明306401-5',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306401-5',
  true,
  true,
  '306401',
  false,
  null
),
(
  -- 予定（日程が合っている）
  3064051,
  306405,
  '予定306405-1',
  '説明306405-1',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  0,
  5,
  '会議室306405-1',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO（日程なし）
  3064052,
  306405,
  '予定306405-2',
  '説明306405-2',
  null,
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306405-2',
  true,
  true,
  null,
  false,
  null
),
(
  -- 予定（日程が異なる）
  3064053,
  306405,
  '予定306405-3',
  '説明306405-3',
  '2022-12-13',
  '0900',
  '1100',
  120,
  15,
  15,
  0,
  5,
  '会議室306405-3',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO(日程が合っている)
  3064054,
  306405,
  '予定306405-4',
  '説明306405-4',
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室30645-4',
  true,
  true,
  null,
  false,
  null
),
(
  -- TODO（日程が異なる）
  3064055,
  306405,
  '予定306405-5',
  '説明306405-5',
  '2022-12-13',
  '0900',
  '1100',
  120,
  15,
  15,
  2,
  5,
  '会議室306405-5',
  true,
  true,
  null,
  false,
  null
);

INSERT INTO "temporary_plans" 
(
  "id",
  "original_plan_id",
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
  "todo_start_time"
)
VALUES
(
  -- 予定の仮予定
  306401,
  3064011,
  306401,
  '予定(変更ずみ）',
  null,
  '2022-12-12',
  '0900',
  '1100',
  120,
  15,
  15,
  0,
  5,
  null,
  null
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
  306404,
  306404,
  null,
  '繰り返し予定306404',
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

INSERT INTO "schedule_plan_inclusion" 
(
  "id",
  "plan_id",
  "schedule_id"
)
VALUES
(
  306401,
  3064011,
  306401
),
(
  306402,
  3064012,
  306401
);