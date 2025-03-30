/** Database setup for swap. */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config.js");

const db = new Client({
  connectionString: getDatabaseUri()
});

db.connect();

module.exports = db;
