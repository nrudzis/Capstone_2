-- all seed users have the password "password"

INSERT INTO users (username, password)
VALUES ('john_doe_12345',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
       ('sarahSmith89',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
       ('michael_the_great',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
       ('emmaWilson2023',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q'),
       ('james.bond.007',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q');

INSERT INTO balances (balance, username)
VALUES (100063.00, 'john_doe_12345'),
       (101012.88, 'sarahSmith89'),
       (99370.49, 'michael_the_great'),
       (100199.62, 'emmaWilson2023'),
       (99354.01, 'james.bond.007');

INSERT INTO transactions (time,
                          amount,
                          username_sending,
                          username_receiving)
VALUES ('2024-12-13 08:30:00+00', 200.89, 'michael_the_great', 'john_doe_12345'),
       ('2024-12-14 12:00:00+00', 123.00, 'michael_the_great', 'emmaWilson2023'),
       ('2024-12-15 17:45:30+00', 7.38, 'michael_the_great', 'sarahSmith89'),
       ('2024-12-16 22:10:15+00', 500.00, 'michael_the_great', 'john_doe_12345'),
       ('2024-12-17 03:59:59+00', 15.00, 'michael_the_great', 'john_doe_12345'),
       ('2024-12-15 06:15:00+00', 78.38, 'sarahSmith89', 'michael_the_great'),
       ('2024-12-16 13:20:45+00', 400.00, 'sarahSmith89', 'james.bond.007'),
       ('2024-12-17 19:55:30+00', 30.00, 'sarahSmith89', 'michael_the_great'),
       ('2023-11-01 10:00:00+00', 600.00, 'john_doe_12345', 'emmaWilson2023'),
       ('2022-05-15 22:30:45+00', 67.89, 'john_doe_12345', 'sarahSmith89'),
       ('2020-07-25 04:45:00+00', 15.00, 'emmaWilson2023', 'john_doe_12345'),
       ('2019-03-10 15:30:15+00', 78.38, 'emmaWilson2023', 'michael_the_great'),
       ('2018-12-01 08:00:00+00', 400.00, 'emmaWilson2023', 'sarahSmith89'),
       ('2021-09-18 19:22:35+00', 30.00, 'emmaWilson2023', 'michael_the_great'),
       ('2024-12-17 19:55:30+00', 1045.99, 'james.bond.007', 'sarahSmith89');
