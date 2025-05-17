/** Routes for authentication */

const { createToken } = require("../helpers/token.js");

const express = require("express");
const User = require("../models/user");

const router = express.Router();
const { validateSchema } = require("../middleware/valid");
const userSchema = require("../schemas/userSchema.json");


/** User model check: authenticate */
router.post("/token", validateSchema(userSchema), async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body);
    const token = createToken(user);
    return res.json({ token, username: user.username });
  } catch (err) {
    return next(err);
  }
});

/** User model check 3: register */
router.post("/register", validateSchema(userSchema), async (req, res, next) => {
  try {
    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ token, username: user.username });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
