const axios = require("axios");
const MarketApi = require("./marketApi.js");


jest.mock("axios");

describe("MarketApi service tests", () => {

  const mockStockAssetInfoResponse = {
    data : {
      "id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
      "class": "us_equity",
      "exchange": "NASDAQ",
      "symbol": "AAPL",
      "name": "Apple Inc. Common Stock",
      "status": "active",
      "tradable": true,
      "marginable": true,
      "maintenance_margin_requirement": 30,
      "margin_requirement_long": "30",
      "margin_requirement_short": "30",
      "shortable": true,
      "easy_to_borrow": true,
      "fractionable": true,
      "attributes": [
        "fractional_eh_enabled",
        "has_options"
      ]
    }
  };

  const mockCryptoAssetInfoResponse = {
    data : {
      "id": "276e2673-764b-4ab6-a611-caf665ca6340",
      "class": "crypto",
      "exchange": "CRYPTO",
      "symbol": "BTC/USD",
      "name": "Bitcoin  / US Dollar",
      "status": "active",
      "tradable": true,
      "marginable": false,
      "maintenance_margin_requirement": 100,
      "margin_requirement_long": "100",
      "margin_requirement_short": "100",
      "shortable": false,
      "easy_to_borrow": false,
      "fractionable": true,
      "attributes": [],
      "min_order_size": "0.000010954",
      "min_trade_increment": "0.000000001",
      "price_increment": "1"
    }
  };

  const mockStockPriceResponse = {
    data : {
      "quote": {
        "ap": 235.37,
        "as": 2,
        "ax": "V",
        "bp": 235.32,
        "bs": 2,
        "bx": "V",
        "c": [
          "R"
        ],
        "t": "2025-03-06T20:59:59.968379653Z",
        "z": "C"
      },
      "symbol": "AAPL"
    }
  };

  const mockCryptoPriceResponse = {
    data : {
      "quotes": {
        "BTC/USD": {
          "ap": 90448.5,
          "as": 0.8009,
          "bp": 90309.2,
          "bs": 0.80971,
          "t": "2025-03-06T22:55:47.106637554Z"
        }
      }
    }
  };

  const PREV_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...PREV_ENV };
    process.env.ALPACA_KEY = "test-key";
    process.env.ALPACA_SECRET = "test-secret";
    axios.mockClear();
  });

  afterEach(() => {
    process.env = PREV_ENV;
  });


  // --- request ---

  test("request: makes GET request with headers and uses 1 when no baseUrlNum is passed", async () => {
    axios.mockResolvedValue({ data: "the data" });

    const result = await MarketApi.request("test-endpoint", { foo: "bar" }); // don't pass baseUrlNum

    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining("https://data.alpaca.markets/test-endpoint"),
      method: "GET",
      headers: expect.objectContaining({
        accept: "application/json",
        "APCA-API-KEY-ID": "test-key",
        "APCA-API-SECRET-KEY": "test-secret"
      }),
      params: { foo: "bar" }
    }));
    expect(result).toEqual({ data: "the data" });
  });

  test("request: uses 2 when baseUrlNum of 2 is passed", async () => {
    axios.mockResolvedValue({ data: "the data 2" });

    const result = await MarketApi.request("test-endpoint2", {}, 2); // pass baseUrlNum of 2

    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining("https://paper-api.alpaca.markets/test-endpoint2")
    }));
    expect(result).toEqual({ data: "the data 2" });
  });

  test("request: logs and throws error with status and message", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const mockError = { response: { status: 500, data: { message: "Internal Server Error" }}, message: "Request failed" };

    axios.mockRejectedValue(mockError);

    await expect(MarketApi.request("failing-request-endpoint")).rejects.toThrow(
      "Request to failing-request-endpoint failed with status 500: Internal Server Error"
    );
    expect(consoleSpy).toHaveBeenCalledWith("API Error:", { status: 500, message: "Internal Server Error" });

    consoleSpy.mockRestore();
  });


  // --- sendOrder ---

  test("sendOrder, stock case: returns all info needed for successful order", async () => {
    axios.mockResolvedValueOnce(mockStockAssetInfoResponse);
    axios.mockResolvedValueOnce(mockStockPriceResponse);

    const sendOrderResult = await MarketApi.sendOrder("AAPL");

    expect(sendOrderResult.symbol).toBe("AAPL");
    expect(sendOrderResult.name).toBe("Apple Inc. Common Stock");
    expect(sendOrderResult.unitPrice).toBeGreaterThanOrEqual(235.32);
    expect(sendOrderResult.unitPrice).toBeLessThanOrEqual(235.37);
  });

  test("sendOrder, crypto case: returns all info needed for successful order", async () => {
    axios.mockResolvedValueOnce(mockCryptoAssetInfoResponse);
    axios.mockResolvedValueOnce(mockCryptoPriceResponse);

    const sendOrderResult = await MarketApi.sendOrder("BTCUSD");

    expect(sendOrderResult.symbol).toBe("BTCUSD");
    expect(sendOrderResult.name).toBe("Bitcoin  / US Dollar");
    expect(sendOrderResult.unitPrice).toBeGreaterThanOrEqual(90309.2);
    expect(sendOrderResult.unitPrice).toBeLessThanOrEqual(90448.5);
  });


  // --- getAssetInfo ---

  test("getAssetInfo, stock case: returns required info for a stock", async () => {
    axios.mockResolvedValue(mockStockAssetInfoResponse);

    const assetInfoResult = await MarketApi.getAssetInfo("AAPL");

    expect(assetInfoResult).toEqual({
      assetClass: "us_equity",
      symbol: "AAPL",
      name: "Apple Inc. Common Stock"
    });
  });

  test("getAssetInfo, crypto case: returns required info for a cryptocurrency", async () => {
    axios.mockResolvedValue(mockCryptoAssetInfoResponse);

    const assetInfoResult = await MarketApi.getAssetInfo("BTCUSD");

    expect(assetInfoResult).toEqual({
      assetClass: "crypto",
      symbol: "BTC/USD",
      name: "Bitcoin  / US Dollar"
    });
  });


  // --- generatePrice ---
  
  test("generatePrice: returns a price between bidPrice and askPrice", async () => {
    const fillPrice = MarketApi.generatePrice(90448.5, 90309.2);

    expect(fillPrice).toBeGreaterThanOrEqual(90309.2);
    expect(fillPrice).toBeLessThanOrEqual(90448.5);
  });


  // --- getStockPrice ---

  test("getStockPrice: returns stock price", async () => {
    axios.mockResolvedValue(mockStockPriceResponse);

    const stockPriceResult = await MarketApi.getStockPrice("AAPL");

    expect(stockPriceResult).toBeGreaterThanOrEqual(235.32);
    expect(stockPriceResult).toBeLessThanOrEqual(235.37);
  });


  // --- getCryptoPrice ---

  test("getCryptoPrice: returns cryptocurrency price", async () => {
    axios.mockResolvedValue(mockCryptoPriceResponse);

    const cryptoPriceResult = await MarketApi.getCryptoPrice("BTC/USD");

    expect(cryptoPriceResult).toBeGreaterThanOrEqual(90309.2);
    expect(cryptoPriceResult).toBeLessThanOrEqual(90448.5);
  });
});
