import { axios } from "../../../services";
import refreshToken, { REFRESH_PATH, authUserSessionKey, getAccessToken } from "./refresh-token";
import dateutils from "date-and-time";

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;
    if (error?.response?.status === 401 && config && !config?.sent) {
      config.sent = true;
      await refreshToken();
      return axios(config);
    }
    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
  async (config) => {
    config.headers.setAuthorization(getAccessToken());
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.request.use(
  async (config) => {
    if (config.url !== REFRESH_PATH) {
      const usrSessionStr = sessionStorage.getItem(authUserSessionKey);
      if (usrSessionStr) {
        const usrDetails = JSON.parse(usrSessionStr);
        if (
          "expiryDate" in usrDetails &&
          dateutils.subtract(new Date(usrDetails.expiryDate), new Date()).toSeconds() <= 30
        ) {
          refreshToken();
        }
      }
    } else {
      const cc = config as any;
      cc.sent = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
