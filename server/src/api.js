import axios from "axios";

const SWAP_BASE_URL = process.env.NODE_ENV === "production"
                        ? process.env.SUPABASE_URL
                        : "http://localhost:3001";

class SwapApi {

  static async request(endpoint, data = {}, method = "get") {
    const url = `${SWAP_BASE_URL}/${endpoint}`;
    const headers = {}; //TODO: implement tokens
    const params = method === "get" ? data : {};
    try {
      return (await axios({ url, method, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);
      //TODO: implement handling logic
    }
  }

  /** Get details on a user. */
  static async getUser(username) {
    let res = await this.request(`users/${username}`);
    return res.user;
  }

  /** Get all the users. */
  static async getAllUsers() {
    let res = await this.request("users");
    return res.users;
  }
}

export default SwapApi;
