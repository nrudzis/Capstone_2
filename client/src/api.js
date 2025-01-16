import axios from "axios";

const SWAP_BASE_URL = process.env.NODE_ENV === "production"
                        ? process.env.SUPABASE_URL
                        : "http://localhost:3001";

class SwapApi {

  static async request(endpoint, data = {}, method = "get") {
    const url = `${SWAP_BASE_URL}/${endpoint}`;
    const headers = {}; // TODO: implement tokens

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
  /** Register a new user. */
  static async register(data) {
    const res = await this.request("register", data, "post");
    return res.user;
  }

  /** Get details on a user. */
  static async getUser(username) {
    const res = await this.request(`users/${username}`);
    return res.data.user;
  }

  /** Get all the users. */
  static async getAllUsers() {
    const res = await this.request("users");
    return res.users;
  }
}

export default SwapApi;
