import db from "../db.js"
import { NotFoundError, BadRequestError } from "../expressError.js"
import bcrypt from "bcrypt"
import { BCRYPT_WORK_FACTOR } from "../config.js"

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
      `SELECT username,
              password
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
              u.password,
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
      await db.query('BEGIN');

      const addTransaction = await db.query(
        `INSERT INTO transactions
         (amount,
          username_sending,
          username_receiving)
         VALUES ($1, $2, $3)
         RETURNING id AS "transactionID"`,
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
         RETURNING balance AS "sendingUserBalance"`,
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

      await db.query('COMMIT');
    } catch (err) {
      await db.query('ROLLBACK');
      console.error(err);
      throw new BadRequestError("Transaction failed.");
    }
  }
}

export default User;
