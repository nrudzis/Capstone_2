const request = require("supertest");
const app = require("../app");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");
const User = require("../models/user");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */
describe("GET /users", function () {
  test("works for users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
        },
        {
          username: "u2"
        }
      ]
    });
  });

  test("unauthorized error for non-users", async function () {
    const resp = await request(app)
      .get("/users")
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** GET /users/:username */
describe("GET /users/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        accountBalance: "100000.00",
        assets: []
      }
    });
  });

  test("unauthorized error for incorrect user", async function () {
    const resp = await request(app)
      .get("/users/u1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized error for non-users", async function () {
    const resp = await request(app)
      .get("/users/u1")
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /users/:username/fund-account */
describe("POST /users/:username/fund-account", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .post("/users/u2/fund-account")
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      message: "Account successfully funded."
    });
  });

  test("unauthorized error for incorrect user", async function () {
    const resp = await request(app)
      .post("/users/u2/fund-account")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized error for non-users", async function () {
    const resp = await request(app)
      .post("/users/u2/fund-account")
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /users/:username/send-funds */
describe("POST /users/:username/send-funds", function () {
  test("works for correct user", async function () {
    await User.fundAccount("u2")
    const resp = await request(app)
      .post("/users/u1/send-funds")
      .set("authorization", `Bearer ${u1Token}`)
      .send({
        usernameReceiving: "u2",
        amount: "100.00"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ message: "Funds sent successfully." });
  });

  test("unauthorized error for incorrect user", async function () {
    const resp = await request(app)
      .post("/users/u1/send-funds")
      .set("authorization", `Bearer ${u2Token}`)
      .send({
        usernameReceiving: "u2",
        amount: "100.00"
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized error for non-users", async function () {
    const resp = await request(app)
      .post("/users/u1/send-funds")
      .send({
        usernameReceiving: "u2",
        amount: "100.00"
      });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /users/:username/market-transaction */
describe("POST /users/:username/market-transaction", function () {
  test("works for correct user", async function () {
    jest.spyOn(User, "marketTransaction").mockResolvedValue(undefined);
    const resp = await request(app)
      .post("/users/u1/market-transaction")
      .set("authorization", `Bearer ${u1Token}`)
      .send({
        symbol: "AAPL",
        orderType: "buy",
        amount: "10"
      });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ message: "Transaction was successful." });
    User.marketTransaction.mockRestore();
  });

  test("unauthorized error for incorrect user", async function () {
    jest.spyOn(User, "marketTransaction").mockResolvedValue(undefined);
    const resp = await request(app)
      .post("/users/u1/market-transaction")
      .set("authorization", `Bearer ${u2Token}`)
      .send({
        symbol: "AAPL",
        orderType: "buy",
        amount: "10"
      });
    expect(resp.statusCode).toEqual(401);
    User.marketTransaction.mockRestore();
  });

  test("unauthorized error for non-users", async function () {
    jest.spyOn(User, "marketTransaction").mockResolvedValue(undefined);
    const resp = await request(app)
      .post("/users/u1/market-transaction")
      .send({
        symbol: "AAPL",
        orderType: "buy",
        amount: "10"
      });
    expect(resp.statusCode).toEqual(401);
    User.marketTransaction.mockRestore();
  });
});
