import { axios } from "../../../shared";
import { getAuthorizationToken } from "./auth-storage";

const publicEndpoints = ["/user/login", "/user/signup"];

axios.interceptors.request.use(
  async (config) => {
    if (!publicEndpoints.includes(config.url as string)) {
      const accessToken = await getAuthorizationToken();
      config.headers.setAuthorization(accessToken);
    }
    config.paramsSerializer = { ...config.paramsSerializer, indexes: null };
    return config;
  },
  (error) => Promise.reject(error)
);
