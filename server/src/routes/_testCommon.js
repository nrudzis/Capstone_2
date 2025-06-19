const db = require("../db");
const User = require("../models/user");

async function commonBeforeAll() {
  await db.query("DELETE FROM users");

  await User.register({
    username: "u1",
    password: "password1"
  });
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
};
