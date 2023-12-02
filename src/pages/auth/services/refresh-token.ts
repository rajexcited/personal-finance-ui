import mem from "mem";
import { axios, handleRestErrors } from "../../../services";
import dateutils from "date-and-time";

export const authTokenSessionKey = "fin-auth-tkn";
export const authUserSessionKey = "fin-auth-usr";
export const REFRESH_PATH = "/user/refresh";

const refreshToken = async () => {
  try {
    const sessionTknStr = sessionStorage.getItem(authTokenSessionKey);
    if (!sessionTknStr) throw new Error("session is not active");
    const sessionTkn = JSON.parse(sessionTknStr);
    const response = await axios.post(REFRESH_PATH, {
      refreshToken: `Bearer ${sessionTkn.accessToken}`,
    });

    if (response.data.expiresIn && response.data.accessToken) {
      sessionStorage.setItem(authTokenSessionKey, JSON.stringify(response.data));
      const usrSessionStr = sessionStorage.getItem(authUserSessionKey);
      if (usrSessionStr) {
        const usrDetails = JSON.parse(usrSessionStr);
        usrDetails.expiryDate = dateutils.addSeconds(new Date(), response.data.expiresIn).getTime();
        sessionStorage.setItem(authUserSessionKey, JSON.stringify(usrDetails));
      }
      return response.data;
    }
  } catch (e) {
    handleRestErrors(e as Error);
    sessionStorage.removeItem(authTokenSessionKey);
    sessionStorage.removeItem(authUserSessionKey);
  }
};

export const getAccessToken = mem(
  (): string | null => {
    const sessionTknStr = sessionStorage.getItem(authTokenSessionKey);
    if (sessionTknStr) {
      const sessionTkn = JSON.parse(sessionTknStr);
      return `Bearer ${sessionTkn.accessToken}`;
    }
    return null;
  },
  { maxAge: 500 }
);

const memoizeRefreshToken = mem(refreshToken, { maxAge: 10 * 1000 });

export default memoizeRefreshToken;
