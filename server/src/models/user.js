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
}

export default User;
