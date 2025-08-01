const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError
} = require("../expressError.js");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const MarketApi = require("../services/marketApi.js");
const db = require("../db.js");
const { groupAndNest } = require("./helpers/group.js");

/** Related functions for users. */

class User {

  /** Authenticate a user with username and password.
   *
   * Returns { username }.
   *
   * Throws UnauthorizedError if user not found or wrong password.
   **/

  static async authenticate({ username, password }) {
    const result = await db.query(
      `SELECT username,
              password
       FROM users
       WHERE username = $1`,
      [username],
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username or password.");
  }

  /** Register a new user.
   *
   * Returns { username }.
   *
   * Throws BadRequestError on duplicate usernames.
   **/

  static async register({ username, password }) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Username "${username}" is not available. Please try a different username.`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
       (username,
        password)
       VALUES ($1, $2)
       RETURNING username`,
      [
        username,
        hashedPassword
      ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Get all the users.
   *
   * Returns [{ username, password }, ...].
   **/

  static async getAll() {
    const { rows } = await db.query(
      `SELECT username
       FROM users
       ORDER BY username`,
    );

    return rows;
  }

  /** Return data about user.
   *
   * Returns { username, accountBalance, assets: [ {asset1Info}, {asset2Info}, ... ] }.
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(username) {
    const { rows } = await db.query(
      `SELECT u.username,
              b.balance AS "accountBalance",
              ua.asset_quantity AS "assetQuantity",
              a.symbol AS "assetSymbol",
              a.name AS "assetName",
              a.class AS "assetClass"
       FROM users u
       LEFT JOIN balances b
       ON u.username = b.username
       LEFT JOIN users_assets ua
       ON u.username = ua.username
       LEFT JOIN assets a
       ON a.id = ua.asset_id
       WHERE u.username = $1`,
      [username],
    );

    if (!rows[0]) throw new NotFoundError(`No user: ${username}`);

    const user = groupAndNest(rows, "username", "assets", [
      "assetQuantity",
      "assetSymbol",
      "assetName",
      "assetClass"
    ])

    return user[0];
  }

  /** Commit a sql transaction.
   *
   * Helper method workaround to avoid unexpected behavior from nested transactions in testing.
   **/

  static async commitTransaction() {
    return await db.query("COMMIT");
  }

  /** Provide a user with a new balance.
   *
   * Deletes user's existing balance, if exists.
   * Creates new $100000 balance.
   * Returns { balanceId }.
   *
   * Throws NotFoundError if user not found.
   * Throws BadRequestError if there is a problem with the transaction.
   **/

  static async fundAccount(username) {
    const userCheck = await db.query(
      `SELECT username
       FROM users 
       WHERE username = $1`,
      [username],
    );

    if(!userCheck.rows[0]) throw new NotFoundError(`No user: ${username}`);

    try {
      await db.query("BEGIN");

      await db.query(
        `DELETE FROM balances
         WHERE username = $1`,
        [username],
      );

      const addFunds = await db.query(
        `INSERT INTO balances
           (balance,
           username)
         VALUES ($1, $2)
         RETURNING id AS "balanceId"`,
        [
          100000.00,
          username
        ],
      );

      if (!addFunds.rows[0]) throw new BadRequestError(`Unable to fund account: ${username}.`);

      await this.commitTransaction();

      return addFunds.rows[0];
    } catch (err) {
      await db.query("ROLLBACK");
      console.error(err);
      throw new BadRequestError("Transaction failed.");
    }
  }

  /** Send funds from one user to another user.
   *
   * Returns { transactionId }.
   *
   * Throws NotFoundError if sending or receiving users don't exist/don't have balances.
   * Throws BadRequestError if sending user doesn't have sufficient funds or if there is a problem with the transaction.
   **/

  static async sendFunds({ usernameSending, usernameReceiving, amount }) {
    const sendingUserCheck = await db.query(
      `SELECT username,
              balance AS "accountBalance"
       FROM balances
       WHERE username = $1`,
      [usernameSending],
    );

    const sendingUserResult = sendingUserCheck.rows[0];

    if (!sendingUserResult) throw new NotFoundError(`Sending user not found: ${usernameSending}.`);
    if (!sendingUserResult.accountBalance || Number(sendingUserResult.accountBalance) < Number(amount)) throw new BadRequestError(`Sending user does not have sufficient funds: ${usernameSending}.`);

    const receivingUserCheck = await db.query(
      `SELECT username
       FROM balances
       WHERE username = $1`,
      [usernameReceiving],
    );

    const receivingUserResult = receivingUserCheck.rows[0];

    if (!receivingUserResult) throw new NotFoundError(`Receiving user not found: ${usernameReceiving}.`); 

    try {
      await db.query("BEGIN");

      const addTransaction = await db.query(
        `INSERT INTO transactions
         (amount,
          username_sending,
          username_receiving)
         VALUES ($1, $2, $3)
         RETURNING id AS "transactionId"`,
        [
          amount,
          usernameSending,
          usernameReceiving
        ],
      );

      if (!addTransaction.rows[0]) throw new BadRequestError(`Error adding transaction for user: ${usernameSending}. Transaction rolled back.`);

      const updateSendingUserBalance = await db.query(
        `UPDATE balances
         SET balance = (balance - $1)
         WHERE username = $2 AND balance >= $1
         RETURNING username, balance AS "sendingUserBalance"`,
        [
          amount,
          usernameSending,
        ],
      );

      if (!updateSendingUserBalance.rows[0]) throw new BadRequestError(`Error updating sending user balance: ${usernameSending}. Transaction rolled back.`);

      const updateReceivingUserBalance = await db.query(
        `UPDATE balances
         SET balance = (balance + $1)
         WHERE username = $2
         RETURNING balance AS "receivingUserBalance"`,
        [
          amount,
          usernameReceiving
        ],
      );

      if (!updateReceivingUserBalance.rows[0]) throw new BadRequestError(`Error updating receiving user balance: ${usernameReceiving}. Transaction rolled back.`);

      await this.commitTransaction();

      return addTransaction.rows[0];
    } catch (err) {
      await db.query("ROLLBACK");
      console.error(err);
      throw new BadRequestError("Transaction failed.");
    }
  }

  /** Buy an asset from the market for a user.
   *
   * Returns { transactionId, assetId }.
   *
   * Throws BadRequestError if user doesn't have sufficient funds or if there is a problem with the transaction.
   **/

  static async marketBuy(username, buySymbol, buyQty) {
    const { symbol, assetClass, name, unitPrice } = await MarketApi.sendOrder(buySymbol);

    const cost = (unitPrice * buyQty);

    const userBalanceCheck = await db.query(
      `SELECT balance AS "accountBalance"
       FROM balances
       WHERE username = $1`,
      [username],
    );

    if (Number(userBalanceCheck.rows[0].accountBalance) < Number(cost)) {
      throw new BadRequestError(`User does not have sufficient funds: ${username}.`);
    } else {
      try {
        await db.query("BEGIN");

        const updateUserBalance = await db.query(
          `UPDATE balances
           SET balance = (balance - $1)
           WHERE username = $2 AND balance >= $1
           RETURNING balance`,
          [
            cost,
            username,
          ],
        );

        if (!updateUserBalance.rows[0]) throw new BadRequestError(`Error updating user balance: ${username}. Transaction rolled back.`);

        const addOrGetAsset = await db.query(
          `WITH ins AS (
             INSERT INTO assets (
               symbol,
               name,
               class
             )
             VALUES ($1, $2, $3)
             ON CONFLICT (symbol)
             DO NOTHING
             RETURNING id
           )
           SELECT id AS "assetId"
           FROM ins
           UNION ALL
           SELECT id AS "assetId"
           FROM assets
           WHERE symbol = $1
           AND NOT EXISTS (SELECT 1 FROM ins)
           LIMIT 1`,
          [
            symbol,
            name,
            assetClass,
          ],
        );

        if (!addOrGetAsset.rows[0]) throw new BadRequestError(`Error adding or getting asset: ${symbol}. Transaction rolled back.`);

        const assetId = addOrGetAsset.rows[0].assetId;

        const addMarketTransaction = await db.query(
          `INSERT INTO market_transactions (
             type,
             username,
             asset_id,
             asset_unit_price,
             asset_quantity
           )
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id as "transactionId"`,
          [
            "buy",
            username,
            assetId,
            unitPrice,
            buyQty
          ],
        );
        if (!addMarketTransaction.rows[0]) throw new BadRequestError(`Error adding market_transaction: buy ${buyQty} ${symbol}. Transaction rolled back.`);

        const updateUsersAssets = await db.query(
          `WITH ins AS (
             INSERT INTO users_assets (
               username,
               asset_id,
               asset_quantity
             )
             VALUES ($1, $2, $3)
             ON CONFLICT (username, asset_id)
             DO UPDATE
             SET asset_quantity = users_assets.asset_quantity + EXCLUDED.asset_quantity
             RETURNING id
           )
           SELECT id AS "usersAssetsId"
           FROM ins`,
          [
            username,
            assetId,
            buyQty
          ],
        );

        if (!updateUsersAssets.rows[0]) throw new BadRequestError(`Error adding or updating users_assets for asset ${assetId}. Transaction rolled back.`);

        await this.commitTransaction();

        return {
          transactionId: addMarketTransaction.rows[0].transactionId,
          assetId: assetId
        }
      } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        throw new BadRequestError("Transaction failed.");
      }
    }
  }


  /** Sell an asset from a user's holdings on the market.
   *
   * Returns { transactionId, assetId }.
   *
   * Throws BadRequestError if user doesn't have sufficient asset quantity or if there is a problem with the transaction.
   **/

  static async marketSell(username, sellSymbol, sellQty) {
    const userAssetCheck = await db.query(
      `SELECT ua.asset_quantity AS "assetQuantity"
       FROM users_assets ua
       INNER JOIN assets a
       ON ua.asset_id = a.id
       WHERE a.symbol = $1 AND ua.username = $2`,
      [
        sellSymbol,
        username
      ],
    );

    if (!userAssetCheck.rows[0] || Number(userAssetCheck.rows[0].assetQuantity) < Number(sellQty)) {
      throw new BadRequestError(`User doesn't have sufficient asset quantity: ${username}`);
    } else {
      try {
        await db.query("BEGIN");

        const { symbol, unitPrice } = await MarketApi.sendOrder(sellSymbol);

        const getAsset = await db.query(
          `SELECT id AS "assetId"
           FROM assets
           WHERE symbol = $1`,
          [symbol]
        );

        if (!getAsset.rows[0]) throw new NotFoundError(`Error getting asset from assets: ${symbol}. Transaction rolled back.`);

        const assetId = getAsset.rows[0].assetId;

        const updateUsersAssets = await db.query(
          `WITH updated AS (
             UPDATE users_assets
             SET asset_quantity = asset_quantity - $1
             WHERE username = $2 AND asset_id = $3
             RETURNING asset_id, asset_quantity
           ),
           deleted AS (
             DELETE FROM users_assets
             WHERE asset_id IN (
               SELECT asset_id
               FROM updated
               WHERE asset_quantity = 0
             )
             RETURNING asset_id
           )
           SELECT asset_id, (
             SELECT asset_quantity
             FROM updated
             WHERE updated.asset_id = users_assets.asset_id
           ) AS asset_quantity
           FROM users_assets
           WHERE asset_id = $3`,
          [
            sellQty,
            username,
            assetId
          ],
        )

        if (!updateUsersAssets.rows[0]) throw new BadRequestError(`Error updating users_assets for asset: ${assetId}. Transaction rolled back.`);

        const addMarketTransaction = await db.query(
          `INSERT INTO market_transactions (
             type,
             username,
             asset_id,
             asset_unit_price,
             asset_quantity
           )
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id AS "transactionId"`,
          [
            "sell",
            username,
            assetId,
            unitPrice,
            sellQty
          ],
        );

        if (!addMarketTransaction.rows[0]) throw new BadRequestError(`Error adding market_transaction: sell ${sellQty} ${symbol}. Transaction rolled back.`);

        const proceeds = (unitPrice * sellQty);

        const updateUserBalance = await db.query(
          `UPDATE balances
           SET balance = (balance + $1)
           WHERE username = $2
           RETURNING balance AS "userBalance"`,
          [
            proceeds,
            username,
          ],
        );

        if (!updateUserBalance.rows[0]) throw new BadRequestError(`Error updating user balance: ${username}. Transaction rolled back.`);

        await this.commitTransaction();

        return {
          transactionId: addMarketTransaction.rows[0].transactionId,
          assetId: assetId
        }
      } catch (err) {
        await db.query("ROLLBACK");
        console.error(err);
        throw new BadRequestError("Transaction failed.");
      }
    }
  }

  /** Market transaction handler.
   *
   * Returns appropriate method (marketBuy or marketSell) based on order type.
   **/
  static async marketTransaction({ username, symbol, orderType, amount }) {
    if (orderType === "buy") {
      return this.marketBuy(username, symbol, amount);
    } else if (orderType === "sell") {
      return this.marketSell(username, symbol, amount);
    } else {
      return null;
    }
  }
}

module.exports = User;
