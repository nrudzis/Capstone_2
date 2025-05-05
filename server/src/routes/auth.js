/** Routes for authentication */

const { createToken } = require("../helpers/token.js");

const express = require("express");
const User = require("../models/user");

const router = express.Router();

/** User model check: authenticate */
router.post("/token", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
});

/** User model check 3: register */
router.post("/register", async (req, res, next) => {
  try {
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ token, username: user.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
