import pMemoize from "p-memoize";
import { axios, subtractDates, UnauthorizedError } from "../../../services";
import { authTokenSessionKey } from "./auth-service";
import { AccessTokenResource } from "./field-types";
import ExpiryMap from "expiry-map";

// adding and managing expenses should not take more than an hour, allotted active time.

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
