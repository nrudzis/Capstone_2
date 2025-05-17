/** Routes for authentication */

const { createToken } = require("../helpers/token.js");

const express = require("express");
const User = require("../models/user");
const { ExpressError } = require("../expressError");

const router = express.Router();
const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userSchema.json");


/** User model check: authenticate */
router.post("/token", async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      const errorStack = result.errors.map(err => err.stack);
      throw new ExpressError(errorStack, 400);
    }
    const user = await User.authenticate(req.body);
    const token = createToken(user);
    return res.json({ token, username: user.username });
  } catch (err) {
    return next(err);
  }
});

/** User model check 3: register */
router.post("/register", async (req, res, next) => {
  try {
    const result = jsonschema.validate(req.body, userSchema);
    if (!result.valid) {
      const errorStack = result.errors.map(err => err.stack);
      throw new ExpressError(errorStack, 400);
    }
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ token, username: user.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
