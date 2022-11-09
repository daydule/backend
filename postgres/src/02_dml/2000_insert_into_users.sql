INSERT INTO "users" 
(
  "user_name",
  "email",
  "password",
  "salt",
  "is_guest"
)
VALUES
(
  'test01',
  'test01@example.com',
  'W+Dck5bziMvXzrhzO00lClrtkyzaH8uYzX6fZUMTsu8=',
  'i7Ri/9DBZL9XXwnpV9PKZQ==',
  false
),
(
  '',
  'guest01@example.com',
  'vYMN67Y1Mczu4Ywfc9w//voQ1ZenLVK9BDHpwq2cr2c=',
  'wy1bEc30bXhCLZhIsm+6wQ==',
  true
);

