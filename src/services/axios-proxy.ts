import axios from "axios";

export const BASE_URL = "http://localhost:5000/my-finance/rest";

const axiosProxy = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosProxy;
