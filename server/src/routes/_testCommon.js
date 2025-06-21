const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/token");


async function commonBeforeAll() {
  await db.query("DELETE FROM users");

  await User.register({
    username: "u1",
    password: "password1"
  });
  await User.register({
    username: "u2",
    password: "password2"
  });
  await User.fundAccount("u1");
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1" });
const u2Token = createToken({ username: "u2" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
};
