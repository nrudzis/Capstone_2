/** Routes for users */

const express = require("express");
const User = require("../models/user");

const router = express.Router();

/** User model check 1: get all */
router.get("/", async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next (err);
  }
});

/** User model check 2: get individual */
router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next (err);
  }
});

/** User model check 4: send funds */
router.post("/:username/send-funds", async (req, res, next) => {
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

/** User model check 5: market transaction */
router.post("/:username/market-transaction", async (req, res, next) => {
  try {
    const marketTransactionDetails = {
      username: req.params.username,
      symbol: req.body.symbol,
      orderType: req.body.orderType,
      amount: req.body.amount
    }
    await User.marketTransaction(marketTransactionDetails);
    return res.status(200).json({ message: "Transaction was successful." });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
