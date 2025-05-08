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

    try {
      return await axios(config);
    } catch (err) {
      console.error("API Error:", err.response);
      // TODO: implement handling logic
    }
  }

  /** Log in a user. */
  static async login(data) {
    const res = await this.request("auth/token", data, "post");
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return { success: true, username: res.data.username };
  }

  /** Register a new user. */
  static async register(data) {
    const res = await this.request("auth/register", data, "post");
    if (res.data.token) localStorage.setItem("token", res.data.token);
    return { success: true, username: res.data.username }
  }

  /** Get details on a user. */
  static async getUser(username) {
    const res = await this.request(`users/${username}`);
    return res.data.user;
  }

  /** Get all the users. */
  static async getAllUsers() {
    const res = await this.request("users");
    return res.data.users;
  }

  /** Log out user. */
  static logout() {
    localStorage.removeItem("token");
    return { success: true, message: "Log out success." };
  }

  /** Fund user's account. */
  static async fundAccount(username) {
    await this.request(`users/${username}/fund-account`, {}, "post");
    return { success: true, message: "Fund account success." };
  }

  /** Send funds to another user. */
  static async sendFunds(usernameSending, data) {
    await this.request(`users/${usernameSending}/send-funds`, data, "post");
    return { success: true, message: "Send funds success." }
  }
}

export default SwapApi;
