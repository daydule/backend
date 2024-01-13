INSERT INTO "users" 
(
  "nickname",
  "email",
  "hashed_password",
  "salt",
  "is_guest",
  "todo_list_order"
)
VALUES
(
  'test01',
  'test01@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  false,
  null
),
(
  '',
  'guest01@example.com',
  '0CbgtrSs4aPbw083Ke8pUBWdMTln7XiTPo/v+n+4xDQ=',
  'iP15S6qSFqFnmPQ9ihQcHA==',
  true,
  null
);

