const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError.js");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
} = require("./auth");
const { SECRET_KEY } = require("../config.js");
const correctJwt = jwt.sign({ username: "testuser" }, SECRET_KEY);
const wrongJwt = jwt.sign({ username: "testuser" }, "wrong");

/************************************** authenticatJWT */
describe("authenticateJWT", function () {
  test("works: token in header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${correctJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "testuser"
      }
    });
  });

  test("works: no token in header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${wrongJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/************************************** ensureLoggedIn */
describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauthorized error if not logged in", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

/************************************** ensureCorrectUser */
describe("ensureCorrectUser", function () {
  test("works", function () {
    expect.assertions(1);
    const req = { params: { username: "testuser" } };
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("unauthorized error if incorrect user", function () {
    expect.assertions(1);
    const req = { params: { username: "wrong" } };
    const res = { locals: { user: { username: "testuser" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req, res, next);
  });
});
