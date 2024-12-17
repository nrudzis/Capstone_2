CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL
);

CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  balance NUMERIC(15, 2) CHECK (balance >= 0),
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount NUMERIC(15, 2) CHECK (amount > 0),
  username_sending VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  username_receiving VARCHAR(25)
    REFERENCES users ON DELETE CASCADE
);
