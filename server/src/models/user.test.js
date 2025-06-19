const db = require("../db.js");
const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../expressError.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
jest.mock("../services/marketApi.js");
const MarketApi = require("../services/marketApi.js");

/************************************** authenticate */

describe("authenticate", () => {
  test("works", async () => {
    const user = await User.authenticate({
      username: "u1",
      password: "password1"
    });
    expect(user).toEqual({
      username: "u1",
    });
  });

  test("unauth if no such user", async () => {
    try {
      await User.authenticate({
        username: "nope",
        password: "password"
      });
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async () => {
    try {
    await User.authenticate({
      username: "u1",
      password: "wrong"
    });
    fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", () => {
  const newUser = { username: "new" };

  test("works", async () => {
    const user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup user", async () => {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getAll */

describe("getAll", () => {
  test("works", async () => {
    const users = await User.getAll();
    expect(users).toEqual([
      {
        username: "u1",
      },
      {
        username: "u2",
      },
    ])
  });
});

/************************************** get */

describe("get", () => {
  test("works: has no assets case", async () => {
    const user = await User.get("u1");
    expect(user).toEqual({
      username: "u1",
      accountBalance: "100000.00",
      assets: []
    });
  });

  test("works: has assets case", async () => {
    const user = await User.get("u2");
    expect(user).toEqual({
      username: "u2",
      accountBalance: "200000.00",
      assets: [{
        assetQuantity: "10",
        assetSymbol: "AAPL",
        assetName: "Apple Inc. Common Stock",
        assetClass: "us_equity"
      }]
    });
  });

  test("not found if no such user", async () => {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** fundAccount */
describe("fundAccount", () => {
  test("works", async () => {
    const { balanceId } = await User.fundAccount("u2");
    expect(typeof balanceId).toBe("number");
    const newFunds = await db.query(
      `SELECT balance FROM balances WHERE username='u2'`);
    expect(newFunds.rows[0].balance).toEqual("100000.00");
  });

  test("not found if no such user", async () => {
    try {
      await User.fundAccount("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** sendFunds */

describe("sendFunds", () => {
  test("works", async () => {
    const { transactionId } = await User.sendFunds({
      usernameSending: "u1",
      usernameReceiving: "u2",
      amount: 100,
    });
    const transaction = await db.query(
      `SELECT * FROM transactions WHERE id = $1`, [transactionId]);
    expect(transaction.rows[0]).toEqual({
      id: transactionId,
      time: expect.any(Date),
      amount: "100.00",
      username_sending: "u1",
      username_receiving: "u2",
    });
    const sendingUser = await db.query(
      `SELECT username, balance AS "accountBalance" FROM balances WHERE username = 'u1'`);
    expect(sendingUser.rows[0]).toEqual({
      username: "u1",
      accountBalance: "99900.00"
    });
    const receivingUser = await db.query(
      `SELECT username, balance AS "accountBalance" FROM balances WHERE username = 'u2'`);
    expect(receivingUser.rows[0]).toEqual({
      username: "u2",
      accountBalance: "200100.00",
    });
  });

  test("not found if no sending user", async () => {
    try {
      await User.sendFunds({
        usernameSending: "nope",
        usernameReceiving: "u2",
        amount: 100,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if insufficient funds", async () => {
    try {
      await User.sendFunds({
        usernameSending: "u1",
        usernameReceiving: "u2",
        amount: 500000,
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("not found if no receiving user", async () => {
    try {
      await User.sendFunds({
        usernameSending: "u1",
        usernameReceiving: "nope",
        amount: 100,
      });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** marketBuy */

describe("marketBuy", () => {
  test("works", async () => {
    MarketApi.sendOrder.mockResolvedValue({
      symbol: "AAPL",
      assetClass: "us_equity",
      name: "Apple Inc. Common Stock",
      unitPrice: 235.34
    });
    const { transactionId, assetId } = await User.marketBuy("u1", "AAPL", 5);
    const transaction = await db.query(
      `SELECT * FROM market_transactions WHERE id = $1`, [transactionId]);
    expect(transaction.rows[0]).toEqual({
      id: transactionId,
      type: "buy",
      time: expect.any(Date),
      username: "u1",
      asset_id: assetId,
      asset_unit_price: "235.34",
      asset_quantity: "5",
    });
    const userBalance = await db.query(
      `SELECT username, balance AS "accountBalance" FROM balances WHERE username = 'u1'`);
    expect(userBalance.rows[0].accountBalance).toEqual("98823.30");
    const asset = await db.query(
      `SELECT * FROM assets WHERE id = $1`, [assetId]);
    expect(asset.rows[0]).toEqual({
      id: assetId,
      symbol: "AAPL",
      name: "Apple Inc. Common Stock",
      class: "us_equity"
    });
    const userAsset = await db.query(
      `SELECT username, asset_id, asset_quantity FROM users_assets WHERE username = 'u1' AND asset_id = $1`, [assetId]);
    expect(userAsset.rows[0]).toEqual({
      username: "u1",
      asset_id: assetId,
      asset_quantity: "5"
    })
    MarketApi.sendOrder.mockClear();
  });

  test("bad request if insufficient funds", async () => {
    MarketApi.sendOrder.mockResolvedValue({
      symbol: "APPL",
      assetClass: "us_equity",
      name: "Apple Inc. Common Stock",
      unitPrice: 235.34
    });
    try {
      await User.marketBuy("u1", "AAPL", 430);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
    MarketApi.sendOrder.mockClear();
  });

  test("works: buy more of owned asset", async () => {
    MarketApi.sendOrder.mockResolvedValue({
      symbol: "AAPL",
      assetClass: "us_equity",
      name: "Apple Inc. Common Stock",
      unitPrice: 235.34
    });
    const firstBuy = await User.marketBuy("u1", "AAPL", 5);
    const secondBuy = await User.marketBuy("u1", "AAPL", 12);
    expect(firstBuy.assetId).toEqual(secondBuy.assetId);
    const asset = await db.query(
      `SELECT * FROM assets WHERE id = $1`, [firstBuy.assetId]);
    expect(asset.rows.length).toEqual(1);
    const userAsset = await db.query(
      `SELECT asset_quantity FROM users_assets WHERE username = 'u1' AND asset_id = $1`, [firstBuy.assetId]);
    expect(userAsset.rows[0].asset_quantity).toEqual("17")
    MarketApi.sendOrder.mockClear();
  });
});

/************************************** marketSell */

describe("marketSell", () => {
  test("works", async () => {
    MarketApi.sendOrder.mockResolvedValue({
      symbol: "AAPL",
      assetClass: "us_equity",
      name: "Apple Inc. Common Stock",
      unitPrice: 235.34
    });
    await User.marketBuy("u1", "AAPL", 12);
    const { transactionId, assetId } = await User.marketSell("u1", "AAPL", 5);
    const transaction = await db.query(
      `SELECT * FROM market_transactions WHERE id = $1`, [transactionId]);
    expect(transaction.rows[0]).toEqual({
      id: transactionId,
      type: "sell",
      time: expect.any(Date),
      username: "u1",
      asset_id: assetId,
      asset_unit_price: "235.34",
      asset_quantity: "5",
    });
    const userBalance = await db.query(
      `SELECT username, balance AS "accountBalance" FROM balances WHERE username = 'u1'`);
    expect(userBalance.rows[0].accountBalance).toEqual("98352.62");
    const userAsset = await db.query(
      `SELECT username, asset_id, asset_quantity FROM users_assets WHERE username = 'u1' AND asset_id = $1`, [assetId]);
    expect(userAsset.rows[0]).toEqual({
      username: "u1",
      asset_id: assetId,
      asset_quantity: "7"
    })
    MarketApi.sendOrder.mockClear();
  });

  test("bad request if insufficient asset quantity", async () => {
    MarketApi.sendOrder.mockResolvedValue({
      symbol: "APPL",
      assetClass: "us_equity",
      name: "Apple Inc. Common Stock",
      unitPrice: 235.34
    });
    try {
      await User.marketSell("u1", "APPL", 10);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    } try {
      await User.marketBuy("u1", "AAPL", 10);
      await User.marketSell("u1", "AAPL", 12);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
    MarketApi.sendOrder.mockClear();
  });
});

/************************************** marketTransaction */

describe("marketTransaction", () => {
  test("works", async () => {
    User.marketBuy = jest.fn();
    User.marketSell = jest.fn();
    await User.marketTransaction({
      username: "u1",
      symbol: "AAPL",
      orderType: "buy",
      amount: 25
    });
    expect(User.marketBuy).toHaveBeenCalled();
    expect(User.marketSell).not.toHaveBeenCalled();
    User.marketBuy = jest.fn();
    User.marketSell = jest.fn();
    await User.marketTransaction({
      username: "u1",
      symbol: "AAPL",
      orderType: "sell",
      amount: 25
    });
    expect(User.marketSell).toHaveBeenCalled();
    expect(User.marketBuy).not.toHaveBeenCalled();
  });
});
