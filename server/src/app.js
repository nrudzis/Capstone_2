/** Express app for swap. */

import express from "express";
import cors from "cors";
import { NotFoundError } from "./expressError.js";
import morgan from "morgan";

import User from "./models/user.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

/** User model check 3: register */
app.post("/register", async (req, res, next) => {
  try {
    const user = await User.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

/** User model check 1: get all */
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next (err);
  }
});

/** User model check 2: get individual */
app.get("/users/:username", async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next (err);
  }
});

/** User model check 4: send funds */
app.post("/users/:username/send-funds", async (req, res, next) => {
  try {
    const sendFundsDetails = {
      usernameSending: req.params.username,
      usernameReceiving: req.body.usernameReceiving,
      amount: req.body.amount
    }
    await User.sendFunds(sendFundsDetails);
    return res.status(200).json({ message: "Funds sent successfully." });
  } catch (err) {
    return next(err);
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
