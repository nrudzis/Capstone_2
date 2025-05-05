/** Express app for swap. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError.js");

const { authenticateJWT } = require("./middleware/auth.js");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);


/** Handle 404 errors. */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

/** Generic error handler. */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status }
  });
});

module.exports = app;
