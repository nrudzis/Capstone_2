/** Express app for swap. */

import express from "express";
import cors from "cors";
import { NotFoundError } from "./expressError.js";
import morgan from "morgan";

import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

/** Check that we can get users. */
app.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT username, password
      FROM users
      ORDER BY username`,
    );
    return res.json({ users: rows });
  } catch (err) {
    return next (err);
  }
});

/** Handle 404 errors. */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

/** Generic error handler. */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status }
  });
});

export default app;
