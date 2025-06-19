const jwt = require("jsonwebtoken");
const { createToken } = require("./token");
const { SECRET_KEY } = require("../config");

/************************************** createToken */

describe("createToken", function() {
  test("works", function() {
    const token = createToken({ username: "testuser" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "testuser"
    });
  });
});
