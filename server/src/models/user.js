import db from "../db.js";
import { NotFoundError } from "../expressError.js"

/** Related functions for users. */

class User {

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
}

export default User;
