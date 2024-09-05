import "./interceptors";
import { LoggerBase, axios, getLogger, handleRestErrors, isBlank, subtractDates } from "../../../shared";
import {
  AccessTokenResource,
  UpdateUserDetailsResource,
  UpdateUserPasswordResource,
  UserDetailsResource,
  UserLoginResource,
  UserSignupResource,
} from "./field-types";
import _ from "lodash";

export const authTokenSessionKey = "fin-auth-tkn";
const authUserSessionKey = "fin-auth-usr";

const AuthenticationServiceImpl = () => {
  const rootPath = "/user";
  /** 10 min */
  const MIN_SESSION_TIME_IN_SEC = 10 * 60;
  const _logger = getLogger("service.auth", null, null, "DISABLED");

  const login = async (details: UserLoginResource) => {
    const logger = getLogger("login", _logger);
    try {
      if (isAuthenticated(logger)) {
        logger.debug("already logged in");
        throw new Error("You are already logged in.");
      }

      const data = {
        emailId: details.emailId,
        password: btoa(details.password),
      };

      const response = await axios.post(`${rootPath}/login`, data);
      const tokenResponse = response.data as AccessTokenResource;
      logger.debug("received token response from api call");

      if (
        !tokenResponse.accessToken ||
        tokenResponse.expiresIn < MIN_SESSION_TIME_IN_SEC ||
        subtractDates(tokenResponse.expiryTime).toSeconds() < MIN_SESSION_TIME_IN_SEC
      ) {
        logger.debug("incorrect auth response", tokenResponse, ", subtractDates.toSeconds() =", subtractDates(tokenResponse.expiryTime).toSeconds());
        throw Error("user login unauthorized");
      }

      sessionStorage.setItem(authTokenSessionKey, JSON.stringify(tokenResponse));
      logger.debug("stored token session");
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const isTokenSessionValid = (loggerBase: LoggerBase) => {
    const logger = getLogger("isTokenSessionValid", loggerBase, null, "DISABLED");
    const tokenSessionDetails = sessionStorage.getItem(authTokenSessionKey);
    logger.debug("token session data =", tokenSessionDetails);
    // scenario 1 - tokenSessionDetails is null - when session gets invalidated
    // scenario 2 - session time is expired
    if (!tokenSessionDetails) {
      cleanupSession();
      return false;
    }

    const tokenSessionResource = JSON.parse(tokenSessionDetails) as AccessTokenResource;
    // assuming margin error in seconds to validate session expiry
    const MARGIN_ERROR_TIME_IN_SEC = 1;

    const validSessionSeconds = subtractDates(tokenSessionResource.expiryTime).toSeconds();
    logger.debug("validSessionSeconds =", validSessionSeconds, ", responding boolean result = ", !(validSessionSeconds <= MARGIN_ERROR_TIME_IN_SEC));
    if (validSessionSeconds <= MARGIN_ERROR_TIME_IN_SEC) {
      cleanupSession();
      return false;
    }

    return true;
  };

  const cleanupSession = () => {
    // clean up session to force user to re-login
    sessionStorage.clear();
  };

  /**
   * Intenal utility method for the service to validate session details
   * if invalid or corrupted session is found, it will be deleted. forcing user to re-login
   *
   * @returns user session details if valid
   */
  const getValidAuthSessionDetails = (loggerBase: LoggerBase) => {
    const logger = getLogger("getValidAuthSessionDetails", loggerBase, null, "DISABLED");
    if (!isTokenSessionValid(logger)) {
      return null;
    }

    const userSessionDetails = sessionStorage.getItem(authUserSessionKey);
    // scenario 2 - userSessionDetails is null - when session is corrupted, leaving partial details into session
    if (!userSessionDetails) {
      logger.debug("user session data not found. so clearing session data");
      cleanupSession();
      return null;
    }

    const userSessionResource = JSON.parse(userSessionDetails) as UserDetailsResource;
    logger.debug("user session data =", userSessionDetails);
    if (!userSessionResource.isAuthenticated) {
      cleanupSession();
      return null;
    }

    return userSessionResource;
  };

  const isAuthenticated = (loggerBase?: LoggerBase): boolean => {
    const logger = getLogger("isAuthenticated", loggerBase);
    try {
      const authDetails = getValidAuthSessionDetails(logger);
      if (authDetails?.isAuthenticated) {
        logger.debug("authen is true");
        return true;
      }
    } catch (e) {
      logger.warn("unknown error", e);
    }
    logger.debug("authen is false");
    return false;
  };

  const logout = async () => {
    const logger = getLogger("logout", _logger);
    logger.debug("session is cleared. calling api");
    try {
      await axios.post(`${rootPath}/logout`);
      logger.debug("api successful");
    } catch (e) {
      logger.debug("error logging out", e);
    } finally {
      cleanupSession();
    }
  };

  /**
   * build full name based on hard coded name template pattern.
   *
   * pattern is "LastName, FirstName"
   *
   * @param firstName
   * @param lastName
   * @returns full name including last name and first name
   */
  const getFullName = (firstName: string, lastName: string) => {
    return _.capitalize(lastName) + ", " + _.capitalize(firstName);
  };

  /**
   * call api to get user details and store to session
   * It first attempts to fetch user details from session. if not available, will fetch from api
   *
   *  @returns user details
   */
  const getUserDetails = async () => {
    const logger = getLogger("getUserDetails", _logger);
    try {
      if (!isTokenSessionValid(logger)) {
        logger.debug("invalid token");
        throw new Error("token is not valid");
      }

      if (authUserSessionKey in sessionStorage) {
        logger.debug("having session data");
        const userSessionDetail = getValidAuthSessionDetails(logger);
        if (userSessionDetail) {
          return userSessionDetail;
        }
      }

      logger.debug("calling api as details in session are null");
      const response = await axios.get(`${rootPath}/details`);
      const userDetailsResponse = response.data as UserDetailsResource;

      logger.debug("api response =", userDetailsResponse);
      if (isBlank(userDetailsResponse.emailId)) {
        throw new Error("missing emailId in response");
      }
      if (isBlank(userDetailsResponse.firstName)) {
        throw new Error("missing firstName in response");
      }
      if (isBlank(userDetailsResponse.lastName)) {
        throw new Error("missing lastName in response");
      }

      const userSessionDetail: UserDetailsResource = {
        emailId: userDetailsResponse.emailId,
        firstName: userDetailsResponse.firstName,
        lastName: userDetailsResponse.lastName,
        isAuthenticated: true,
        fullName: getFullName(userDetailsResponse.firstName, userDetailsResponse.lastName),
      };

      sessionStorage.setItem(authUserSessionKey, JSON.stringify(userSessionDetail));
      logger.debug("stored user data session");
      return userSessionDetail;
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
    }
    logger.debug("responding dummy user data");
    const dummyUserDetail: UserDetailsResource = {
      emailId: "",
      firstName: "",
      lastName: "",
      isAuthenticated: false,
      fullName: "",
    };
    return dummyUserDetail;
  };

  const signup = async (details: UserSignupResource) => {
    const logger = getLogger("signup", _logger);
    try {
      if (isAuthenticated(logger)) {
        logger.debug("logged in already");
        throw new Error("You are already logged in.");
      }

      const data = { ...details, password: btoa(details.password) };
      // default configs will be created with sign up
      const response = await axios.post(`${rootPath}/signup`, data);
      const tokenResponse = response.data as AccessTokenResource;
      if (
        !tokenResponse.accessToken ||
        tokenResponse.expiresIn < MIN_SESSION_TIME_IN_SEC ||
        subtractDates(tokenResponse.expiryTime).toSeconds() < MIN_SESSION_TIME_IN_SEC
      ) {
        logger.debug("token response is invalid. sign up unsuccessful");
        throw Error("user signup unsuccessful");
      }

      sessionStorage.setItem(authTokenSessionKey, JSON.stringify(tokenResponse));
      logger.debug("stored token session data");
      const userSessionDetails: UserDetailsResource = {
        emailId: details.emailId,
        firstName: details.firstName,
        lastName: details.lastName,
        isAuthenticated: true,
        fullName: getFullName(details.firstName, details.lastName),
      };
      logger.debug("stored user session data");
      sessionStorage.setItem(authUserSessionKey, JSON.stringify(userSessionDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const updateName = async (details: UpdateUserDetailsResource) => {
    const logger = getLogger("updateName", _logger);
    try {
      const response = await axios.post(`${rootPath}/details`, details);

      logger.debug("overwriting user session data");
      const sessionDetails = JSON.parse(sessionStorage.getItem(authUserSessionKey) as string) as UserDetailsResource;
      const newSessionDetails: UserDetailsResource = {
        emailId: sessionDetails.emailId,
        firstName: details.firstName,
        lastName: details.lastName,
        isAuthenticated: sessionDetails.isAuthenticated,
        fullName: getFullName(details.firstName, details.lastName),
      };
      sessionStorage.setItem(authUserSessionKey, JSON.stringify(newSessionDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const updatePassword = async (details: UpdateUserPasswordResource) => {
    const logger = getLogger("updatePassword", _logger);
    try {
      // encode before sending over api call
      const data: UpdateUserPasswordResource = {
        password: btoa(details.password),
        newPassword: btoa(details.newPassword),
      };
      const response = await axios.post(`${rootPath}/details`, data);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const getTokenExpiryTime = () => {
    const logger = getLogger("getTokenExpiryTime", _logger, null, "DISABLED");
    if (isTokenSessionValid(logger)) {
      const tokenSessionResource = JSON.parse(sessionStorage.getItem(authTokenSessionKey) as string) as AccessTokenResource;
      const subtractResult = subtractDates(tokenSessionResource.expiryTime);
      logger.debug("subtract diff =", subtractResult);
      return subtractResult.toSeconds();
    }
    logger.debug("invalid token session, so time diff is negative");
    return -1;
  };

  const refreshToken = async () => {
    const logger = getLogger("refreshToken", _logger);
    try {
      const response = await axios.post(`${rootPath}/refresh`);

      const tokenResponse = response.data as AccessTokenResource;
      if (
        !tokenResponse.accessToken ||
        tokenResponse.expiresIn < MIN_SESSION_TIME_IN_SEC ||
        subtractDates(tokenResponse.expiryTime).toSeconds() < MIN_SESSION_TIME_IN_SEC
      ) {
        logger.debug("invalid token response from api");
        throw Error("user unauthorized");
      }

      sessionStorage.setItem(authTokenSessionKey, JSON.stringify(tokenResponse));
      logger.debug("stored refreshed token data to session");
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      logger.debug("clearing session data");
      sessionStorage.removeItem(authTokenSessionKey);
      sessionStorage.removeItem(authUserSessionKey);
      throw Error("unknown error");
    }
  };

  return {
    login,
    logout,
    isAuthenticated,
    getUserDetails,
    signup,
    getTokenExpiryTime,
    refreshToken,
    updateName,
    updatePassword,
  };
};

export default AuthenticationServiceImpl;
