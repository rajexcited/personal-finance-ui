import axios from "axios";

const DOMAIN = process.env.domain || "http://localhost:5000";
const BASE_URL = (process.env.REACT_APP_BASE_PATH || "/my-finance") + "/rest";

const axiosProxy = axios.create({
  baseURL: DOMAIN + BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosProxy;
