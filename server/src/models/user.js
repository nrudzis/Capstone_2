const { NotFoundError, BadRequestError } = require("../expressError.js");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");
const MarketApi = require("../services/marketApi.js");
const db = require("../db.js");

/** Related functions for users. */

class User {

  /** Register a new user.
   *
   * Returns { username }
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

  /** Given a username, return data about user.
   *
   * Returns { username, password }.
   **/

  static async get(username) {
    const { rows } = await db.query(
      `SELECT u.username,
              b.balance AS "accountBalance"
       FROM users u
       LEFT JOIN balances b
       ON u.username = b.username
       WHERE u.username = $1`,
      [username],
    );

    if (!rows[0]) throw new NotFoundError(`No user: ${username}`);

    return rows[0];
  }

  static async commitTransaction() {
    return await db.query("COMMIT");
  }

  /** Given a sending username, receiving username, and amount to send,
   * deducts amount from sending user's balance and adds it to receiving
   * user's balance.
   *
   * Throws error if sending or receiving users don't exist/don't have
   * accounts, sending user doesn't have sufficient funds.
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
    if (!sendingUserResult.accountBalance || Number(sendingUserResult.accountBalance) < amount) throw new BadRequestError(`Sending user does not have sufficient funds: ${usernameSending}.`);

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

  //orderType = 'BUY'
  //  MarketApi.sendOrder(symbol)
  //  -> { symbol, name, price }
  //  -> if (balance < (price * amount) throw Error;
  //  -> else
  //       -> update BALANCES: balance = balance - (price * amount)
  //       -> get asset id from ASSETS (create or get)
  //       -> update MARKET_TRANSACTIONS
  //       -> update USER_ASSETS

  static async marketBuy(username, buySymbol, buyQty) {
    const { symbol, assetClass, name, unitPrice } = await MarketApi.sendOrder(buySymbol);

    const cost = (unitPrice * buyQty);

    const userBalanceCheck = await db.query(
      `SELECT balance AS "accountBalance"
       FROM balances
       WHERE username = $1`,
      [username],
    );

    if (userBalanceCheck.rows[0].accountBalance < cost) {
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


  //orderType = 'SELL'
  //  get ASSET id
  //  -> if (!user_asset || amount > userAssetAmount) throw Error;
  //  -> else
  //       -> MarketApi.sendOrder(symbol)
  //       -> { symbol, name, price }
  //       -> update BALANCES: balance = balance + (price * amount)
  //       -> update ASSET_TRANSACTIONS
  //       -> update USER_ASSETS

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

    if (!userAssetCheck.rows[0] || userAssetCheck.rows[0].assetQuantity < sellQty) {
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
