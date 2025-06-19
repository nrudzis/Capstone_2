const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */
describe("POST /auth/token", function () {
  test("works", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "password1"
      });
    expect(resp.body).toEqual({
      "token": expect.any(String),
      "username": "u1"
    });
  });

  test("unauthorized error with wrong password", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1",
        password: "wrong"
      });
    expect(resp.statusCode).toEqual(401)
  });

  test("unauthorized error with non-registered user", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u3",
        password: "password3"
      });
    expect(resp.statusCode).toEqual(401)
  });

  test("express error with missing data", async function () {
    const resp = await request(app)
      .post("/auth/token")
      .send({
        username: "u1"
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("express error with invalid data", async function () {
    resp = await request(app)
      .post("/auth/token")
      .send({
        username: 1234, // number type is invalid
        password: "password1"
      });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** POST /auth/register */
describe("POST /auth/register", function () {
  test("works", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser",
        password: "password"
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      "token": expect.any(String),
      "username": "newuser"
    });
  });

  test("express error with missing data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "newuser"
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("express error with invalid data", async function () {
    const resp = await request(app)
      .post("/auth/register")
      .send({
        username: "thisUsernameHasTooManyCharacters", // username must be 20 characters or less
        password: "password"
      });
    expect(resp.statusCode).toEqual(400);
  });
});
