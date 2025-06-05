const axios = require("axios");
const { API_BASE_URL_1 } = require("../config.js");
const { API_BASE_URL_2 } = require("../config.js");


/** Related functions for external market api. */

class MarketApi {

  /** Build request object and send GET request.
   *
   * Returns response object.
   *
   * Logs and throws error with status and message.
   */

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
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      console.error("API Error:", { status, message });
      throw new Error(`Request to ${endpoint} failed with status ${status}: ${message}`)
    }
  }

  /** Given an asset symbol, returns asset info and price.
   *
   * Returns { symbol, assetClass, name, unitPrice }.
   */

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
      symbol: assetInfo.symbol.replace(/\//g, ''),
      assetClass: assetInfo.assetClass,
      name: assetInfo.name,
      unitPrice: assetPrice
    };
  }

  /** Given an asset symbol, returns asset info.
   *
   * Returns { assetClass, symbol, name }.
   */

  static async getAssetInfo(symbol) {
    const { data } = await this.request(`v2/assets/${symbol}`, undefined, 2);
    return {
      assetClass: data.class,
      symbol: data.symbol,
      name: data.name
    };
  }

  /** Given an ask price and a bid price, returns a random fill price.
   */

  static generatePrice(askPrice, bidPrice) {
    return Math.random() * (askPrice - bidPrice) + bidPrice;
  }

  /** Given a stock symbol, returns a fill price based on latest ask price and bid price.
   */

  static async getStockPrice(symbol) {
    const { data } = await this.request(`v2/stocks/${symbol}/quotes/latest`);
    const latestAskPrice = data.quote.ap;
    const latestBidPrice = data.quote.bp;
    return this.generatePrice(latestAskPrice, latestBidPrice);
  }

  /** Given a crypto symbol, returns a fill price based on latest ask price and bid price.
   */

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
