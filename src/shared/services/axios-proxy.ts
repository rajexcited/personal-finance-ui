import axios from "axios";

const BASE_URL = process.env.REACT_APP_REST_API_BASE_PATH;

const axiosProxy = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosProxy;
