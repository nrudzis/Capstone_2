const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db.js");
const User = require("./user.js");

async function commonBeforeAll() {
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM balances");
  await db.query("DELETE FROM transactions");
  await db.query("DELETE FROM assets");
  await db.query("DELETE FROM market_transactions");
  await db.query("DELETE FROM users_assets");

  await db.query(`
    INSERT INTO users(username, password)
    VALUES ('u1', $1),
           ('u2', $2)`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
    ]
  );

  await db.query(`
    INSERT INTO balances(balance, username)
    VALUES (100000, 'u1'),
           (200000, 'u2')`
  );

  await db.query(`
    INSERT INTO assets(symbol, name, class)
    VALUES ('AAPL', 'Apple Inc. Common Stock', 'us_equity')`
  );

  const { rows } = await db.query(`
    SELECT id FROM assets WHERE symbol='AAPL'`
  );

  const assetId = rows[0];

  await db.query(`
    INSERT INTO users_assets(username, asset_id, asset_quantity)
    VALUES ('u2', $1, 10)`,
    [assetId.id],
  );
}

async function commonBeforeEach() {
  User.commitTransaction = jest.fn();
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
