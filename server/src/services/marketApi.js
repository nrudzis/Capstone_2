const axios = require("axios");
const { API_BASE_URL_1 } = require("../config.js");
const { API_BASE_URL_2 } = require("../config.js");
//import { NotFoundError, BadRequestError } from "../expressError.js"


/** Related functions for external market api. */

class MarketApi {

  static async request(endpoint, data = {}, baseUrlNum = 1) {
    const baseUrl = (() => {
      if (baseUrlNum === 1) return API_BASE_URL_1;
      if (baseUrlNum === 2) return API_BASE_URL_2;
    })();
    const url = `${baseUrl}/${endpoint}`;
    const headers = {
      accept: "application/json",
      "APCA-API-KEY-ID": process.env.ALPACA_KEY,
      "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET
    };

    const config = {
      url,
      method: "GET",
      headers,
      params: data
    };

    try {
      return await axios(config);
    } catch (err) {
      console.error("API Error:", err.response);
      // TODO: Implement handling logic
    }
  }

/** What it does.
   *
   * Returns <returned-format>.
   *
   * Errors?
   **/

  static async sendOrder(symbol) {
    const assetInfo = await this.getAssetInfo(symbol);
    const assetPrice = await (async () => {
      if (assetInfo.assetClass === "us_equity") {
        return await this.getStockPrice(assetInfo.symbol);
      }
      if (assetInfo.assetClass === "crypto") {
        return await this.getCryptoPrice(assetInfo.symbol);
      }
    })();
    return {
      symbol: assetInfo.symbol,
      assetClass: assetInfo.assetClass,
      name: assetInfo.name,
      unitPrice: assetPrice
    };
  }

/** What it does.
   *
   * Returns <returned-format>.
   *
   * Errors?
   **/

  static async getAssetInfo(symbol) {
    const { data } = await this.request(`v2/assets/${symbol}`, undefined, 2);
    return {
      assetClass: data.class,
      symbol: data.symbol,
      name: data.name
    };
  }

/** What it does.
   *
   * Returns <returned-format>.
   *
   * Errors?
   **/

  static generatePrice(askPrice, bidPrice) {
    return Math.random() * (askPrice - bidPrice) + bidPrice;
  }

  /** What it does.
   *
   * Returns <returned-format>.
   *
   * Errors?
   **/

  static async getStockPrice(symbol) {
    const { data } = await this.request(`v2/stocks/${symbol}/quotes/latest`);
    const latestAskPrice = data.quote.ap;
    const latestBidPrice = data.quote.bp;
    return this.generatePrice(latestAskPrice, latestBidPrice);
  }

/** What it does.
   *
   * Returns <returned-format>.
   *
   * Errors?
   **/

  static async getCryptoPrice(symbol) {
    const params = {
      symbols: symbol 
    }
    const { data } =  await this.request("v1beta3/crypto/us/latest/quotes", params);
    const latestAskPrice = data.quotes[symbol].ap;
    const latestBidPrice = data.quotes[symbol].bp;
    return this.generatePrice(latestAskPrice, latestBidPrice);
  }
}

module.exports = MarketApi;



  //  EXAMPLE (crypto and stock):
  //  {
  //    "id": "0515189d-1933-4a94-89ce-4e9a24356d58",
  //    "class": "crypto",                              - this
  //    "exchange": "CRYPTO",
  //    "symbol": "AVAX/USD",                           - this
  //    "name": "Avalanche / US Dollar",                - this
  //    "status": "active",
  //    "tradable": true,
  //    "marginable": false,
  //    "maintenance_margin_requirement": 100,
  //    "margin_requirement_long": "100",
  //    "margin_requirement_short": "100",
  //    "shortable": false,
  //    "easy_to_borrow": false,
  //    "fractionable": true,
  //    "attributes": [],
  //    "min_order_size": "0.047528517",
  //    "min_trade_increment": "0.000000001",
  //    "price_increment": "0.0005"
  //  }
  //
  //  {
  //    "id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
  //    "class": "us_equity",                           - this
  //    "exchange": "NASDAQ",
  //    "symbol": "AAPL",                               - this
  //    "name": "Apple Inc. Common Stock",              - this
  //    "status": "active",
  //    "tradable": true,
  //    "marginable": true,
  //    "maintenance_margin_requirement": 30,
  //    "margin_requirement_long": "30",
  //    "margin_requirement_short": "30",
  //    "shortable": true,
  //    "easy_to_borrow": true,
  //    "fractionable": true,
  //    "attributes": [
  //      "fractional_eh_enabled",
  //      "has_options"
  //    ]
  //  }

  //  EXAMPLE (AAPL):
  //  {
  //    "quote": {
  //      "ap": 252.3,
  //      "as": 1,
  //      "ax": "V",
  //      "bp": 233,
  //      "bs": 1,
  //      "bx": "V",
  //      "c": [
  //        "R"
  //      ],
  //      "t": "2025-02-27T20:59:59.431621087Z",
  //      "z": "C"
  //    },
  //    "symbol": "AAPL"
  //  }

  //  EXAMPLE (BTC/USD):
  //  {
  //    "quotes": {
  //      "BTC/USD": {
  //        "ap": 80598.791,
  //        "as": 0.805028,
  //        "bp": 80495.293,
  //        "bs": 0.807003,
  //        "t": "2025-02-28T04:55:30.361113296Z"
  //      }
  //    }
  //  }

