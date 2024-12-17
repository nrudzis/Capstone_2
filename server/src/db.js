/** Database setup for swap. */

import pg from "pg";
import { getDatabaseUri } from "./config.js";

let db = new pg.Client({
  connectionString: getDatabaseUri()
});

db.connect();

export default db;
