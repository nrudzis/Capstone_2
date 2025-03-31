/** Start server for swap. */

const app = require("./app.js");
const { PORT } = require("./config.js");

app.listen(PORT, () => {
  console.log(`Started server on http://localhost:${PORT}`);
});
