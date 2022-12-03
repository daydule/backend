INSERT INTO "users" 
(
  "nickname",
  "email",
  "hashed_password",
  "salt",
  "is_guest"
)
VALUES
(
  'test01',
  'test01@example.com',
  'AqAiCY+SW+adRHoJm3GppjJM6uKsb5LZo1LjbXkkfzU=',
  'i7Ri/9DBZL9XXwnpV9PKZQ==',
  false
),
(
  '',
  'guest01@example.com',
  'AqAiCY+SW+adRHoJm3GppjJM6uKsb5LZo1LjbXkkfzU=',
  'i7Ri/9DBZL9XXwnpV9PKZQ==',
  true
);

