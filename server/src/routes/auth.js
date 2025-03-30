/** Routes for authentication */

const express = require("express");
const User = require("../models/user");

const router = express.Router();

/** User model check 3: register */
router.post("/register", async (req, res, next) => {
  try {
    const user = await User.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
