import pMemoize from "p-memoize";
import { axios, subtractDates, UnauthorizedError } from "../../../services";
import { authTokenSessionKey } from "./auth-service";
import { AccessTokenResource } from "./field-types";
import ExpiryMap from "expiry-map";

// let's not refresh the token automatically. let user do manually.
// adding and managing expenses should not take more than an hour, allotted active time.

// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const config = error?.config;
//     if (error?.response?.status === 401 && config && !config?.sent) {
//       config.sent = true;
//       await refreshToken();
//       return axios(config);
//     }
//     return Promise.reject(error);
//   }
// );

const publicEndpoints = ["/user/login", "/user/signup"];

axios.interceptors.request.use(
  async (config) => {
    if (!publicEndpoints.includes(config.url as string)) {
      const accessToken = await getAccessToken();
      config.headers.setAuthorization(accessToken);
    }
    config.paramsSerializer = { ...config.paramsSerializer, indexes: null };
    return config;
  },
  (error) => Promise.reject(error)
);

// axios.interceptors.request.use(
//   async (config) => {
//     if (config.url !== REFRESH_PATH) {
//       const usrSessionStr = sessionStorage.getItem(authUserSessionKey);
//       if (usrSessionStr) {
//         const usrDetails = JSON.parse(usrSessionStr);
//         if (
//           "expiryDate" in usrDetails &&
//           dateutils.subtract(new Date(usrDetails.expiryDate), new Date()).toSeconds() <= 30
//         ) {
//           refreshToken();
//         }
//       }
//     } else {
//       const cc = config as any;
//       cc.sent = true;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
export const getAccessToken = pMemoize(
  async () => {
    const tokenSessionDetails = sessionStorage.getItem(authTokenSessionKey);
    if (tokenSessionDetails) {
      const tokenSessionResource = JSON.parse(tokenSessionDetails) as AccessTokenResource;
      if (subtractDates(tokenSessionResource.expiryTime).toSeconds() > 0) {
        return `Bearer ${tokenSessionResource.accessToken}`;
      }
    }
    throw new UnauthorizedError("missing access token");
  },
  { cache: new ExpiryMap(1000) }
);
