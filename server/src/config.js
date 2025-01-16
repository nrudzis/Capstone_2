/** Shared config for application. */

import "dotenv/config";

export const PORT = +process.env.PORT || 3001;

export const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

export function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
    ? "postgresql:///swap_test"
    : process.env.DATABASE_URL || "postgresql:///swap"
}
