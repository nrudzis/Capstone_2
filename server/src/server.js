/** Start server for swap. */

import app from "./app.js";
import { PORT } from "./config.js";

app.listen(PORT, () => {
  console.log(`Started server on http://localhost:${PORT}`);
});
