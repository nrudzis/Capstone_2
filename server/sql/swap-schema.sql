CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL
);

CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  balance NUMERIC(15, 2) CHECK (balance >= 0),
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE
    -- remove balance record if the user is deleted
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount NUMERIC(15, 2) CHECK (amount > 0),
  username_sending VARCHAR(25)
    REFERENCES users ON DELETE SET NULL,
    -- set NULL if user is deleted, handle on front-end
  username_receiving VARCHAR(25)
    REFERENCES users ON DELETE SET NULL
    -- set NULL if user is deleted, handle on front-end
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(15) NOT NULL,
  name VARCHAR(25) NOT NULL,
  category VARCHAR(10) NOT NULL
);

CREATE TABLE users_assets (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
    -- delete if user is deleted
  asset_id INTEGER
    REFERENCES assets(id) ON DELETE RESTRICT,
    -- don't delete referenced asset
  asset_quantity NUMERIC(30) NOT NULL
);

CREATE TABLE market_transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(4)
    CHECK (type = 'buy' OR type = 'sell'),
  time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username VARCHAR(50)
    REFERENCES users ON DELETE CASCADE,
    -- delete if user is deleted
  asset_id INTEGER
    REFERENCES assets(id) ON DELETE RESTRICT,
    -- don't delete referenced asset
  asset_unit_price NUMERIC(30) NOT NULL,
  asset_quantity NUMERIC(30) NOT NULL
);
