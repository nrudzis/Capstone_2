/** Shared config for application. */

require("dotenv/config");

const PORT = +process.env.PORT || 3001;

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

const API_BASE_URL_1 = "https://data.alpaca.markets";
const API_BASE_URL_2 = "https://paper-api.alpaca.markets";

function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
    ? "postgresql:///swap_test"
    : process.env.DATABASE_URL || "postgresql:///swap"
}

module.exports = {
  PORT,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  API_BASE_URL_1,
  API_BASE_URL_2,
  getDatabaseUri 
};
