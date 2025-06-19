const { ExpressError } = require("../expressError");
const { validateSchema } = require("./valid");
const sendFundsSchema = require("../schemas/sendFundsSchema.json");

/************************************** validateSchema */
describe("validateSchema", function () {
  test("works", function () {
    expect.assertions(1);
    const req = { body: { usernameReceiving: "testuser2", amount: "100.00" }, params: { username: "testuser1" } };
    const res = { locals: { user: { username: "testuser1" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    const middlewareValidateSchema = validateSchema(sendFundsSchema);
    middlewareValidateSchema(req, res, next);
  });

  test("express error if invalid", function () {
    expect.assertions(1);
    const req = { body: { usernameReceiving: "testuser2" }, params: { username: "testuser1" } }; // "amount" missing from request body
    const res = { locals: { user: { username: "testuser1" } } };
    const next = function (err) {
      expect(err instanceof ExpressError).toBeTruthy();
    };
    const middlewareValidateSchema = validateSchema(sendFundsSchema);
    middlewareValidateSchema(req, res, next);
  });
});
