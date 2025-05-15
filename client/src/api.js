import axios from "axios";

const SWAP_BASE_URL = process.env.NODE_ENV === "production"
                        ? process.env.SUPABASE_URL
                        : "http://localhost:3001";

class SwapApi {

  static async request(endpoint, data = {}, method = "get") {
    const url = `${SWAP_BASE_URL}/${endpoint}`;
    const headers = {};
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // define axios configuration
    const config = {
      url,
      method,
      headers,
      params: method === "get" ? data : undefined,
      data: method !== "get" ? data : undefined,
    };

    return await axios(config);
  }

  /** Generic method to handle api errors. */
  static handleError(err) {
    const message = err.response.data.error.message || "An unknown error occured.";
    console.error(`API Error: ${message}`);
    return { success: false, error: message }
  }

  /** Log in a user. */
  static async login(data) {
    try {
      const res = await this.request("auth/token", data, "post");
      if (res.data.token) localStorage.setItem("token", res.data.token);
      return { success: true, username: res.data.username };
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Register a new user. */
  static async register(data) {
    try {
      const res = await this.request("auth/register", data, "post");
      if (res.data.token) localStorage.setItem("token", res.data.token);
      return { success: true, username: res.data.username }
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Get details on a user. */
  static async getUser(username) {
    try {
      const res = await this.request(`users/${username}`);
      return res.data.user;
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Get all the users. */
  static async getAllUsers() {
    try {
      const res = await this.request("users");
      return res.data.users;
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Log out user. */
  static logout() {
    try {
      localStorage.removeItem("token");
      return { success: true, message: "Log out success." };
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Fund user's account. */
  static async fundAccount(username) {
    try {
      await this.request(`users/${username}/fund-account`, {}, "post");
      return { success: true, message: "Fund account success." };
    } catch (err) {
      return this.handleError(err);
    }
  }

  /** Send funds to another user. */
  static async sendFunds(usernameSending, data) {
    try {
      await this.request(`users/${usernameSending}/send-funds`, data, "post");
      return { success: true, message: "Send funds success." }
    } catch (err) {
      return this.handleError(err)
    }
  }

  /** Buy/sell assets. */
  static async marketTransaction(username, data) {
    try {
      await this.request(`users/${username}/market-transaction`, data, "post")
      return { success: true, message: "Transaction success." }
    } catch (err) {
      return this.handleError(err);
    }
  }
}

export default SwapApi;
