/** Middleware to handle auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const { UnauthorizedError } = require("../expressError.js");


/** Authenticate user.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Ensure logged in.
 */
function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) {
      throw new UnauthorizedError;
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Ensure user is username.
 */
function ensureCorrectUser(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && user.username === req.params.username)) {
      throw new UnauthorizedError;
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
};
