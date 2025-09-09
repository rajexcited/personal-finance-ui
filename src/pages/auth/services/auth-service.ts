import "./interceptors";
import { LoggerBase, UnauthorizedError, axios, getCacheOption, getLogger, handleRestErrors } from "../../../shared";
import {
  CountryResource,
  UpdateUserDetailsResource,
  UpdateUserPasswordResource,
  UserDetailsResource,
  UserLoginResource,
  UserSignupResource,
  UserStatus
} from "./field-types";
import pMemoize, { pMemoizeClear } from "p-memoize";
import {
  cleanupSession,
  deleteUser,
  getRemainingExpiryTimeInSeconds,
  getValidUserDetails,
  updateAuthorizationToken,
  updateNameInDetails,
  updateUserDetails
} from "./auth-storage";
import { pMemoizeSyncClear } from "../../../shared/utils/cache-utils";

const rootPath = "/user";
const MARGIN_ERROR_TIME_IN_SEC = 1;
const _logger = getLogger("service.auth", null, null, "DISABLED");

export const login = pMemoize(async (details: UserLoginResource, forceLogin: boolean) => {
  const logger = getLogger("login", _logger);
  try {
    if (isAuthenticated(logger)) {
      logger.debug("already logged in");
      throw new Error("You are already logged in.");
    }

    const data = {
      emailId: details.emailId,
      password: btoa(details.password),
      forceLogin: forceLogin
    };

    const response = await axios.post(`${rootPath}/login`, data);
    logger.debug("received token response from api call");
    updateAuthorizationToken(response);
    pMemoizeClear(getUserDetails);
    getUserDetails();
    logger.debug("stored token session");
  } catch (e) {
    try {
      const err = e as Error;
      handleRestErrors(err, logger);
    } catch (resterr) {
      if (resterr instanceof UnauthorizedError) {
        throw new Error("emailId or password invalid");
      }
      throw resterr;
    }
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

const isTokenSessionValid = (loggerBase: LoggerBase) => {
  const logger = getLogger("isTokenSessionValid", loggerBase, null, "DISABLED");
  const validSessionSeconds = getRemainingExpiryTimeInSeconds();
  logger.debug("validSessionSeconds =", validSessionSeconds, ", responding boolean result = ", !(validSessionSeconds <= MARGIN_ERROR_TIME_IN_SEC));
  if (validSessionSeconds <= MARGIN_ERROR_TIME_IN_SEC) {
    cleanupSession();
    return false;
  }

  return true;
};

export const isAuthenticated = (loggerBase?: LoggerBase): boolean => {
  const logger = getLogger("isAuthenticated", loggerBase);
  try {
    const authDetails = getValidUserDetails(logger);
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

export const logout = pMemoize(async () => {
  const logger = getLogger("logout", _logger);
  logger.debug("session is cleared. calling api");
  try {
    // to make user experience better, not waiting for response. actual api call may take  upto 3 sec
    await axios.post(`${rootPath}/logout`);
    logger.debug("api successful");
  } catch (e) {
    logger.debug("error logging out", e);
  } finally {
    pMemoizeSyncClear(cleanupSession);
    cleanupSession();
  }
}, getCacheOption("3 sec"));

/**
 * call api to get user details and store to session
 * It first attempts to fetch user details from session. if not available, will fetch from api
 *
 *  @returns user details
 */
export const getUserDetails = pMemoize(async () => {
  const logger = getLogger("getUserDetails", _logger);
  try {
    if (!isTokenSessionValid(logger)) {
      logger.debug("invalid token");
      throw new Error("token is not valid");
    }

    logger.debug("having session data");
    let validUserDetail = getValidUserDetails(logger);
    if (validUserDetail?.isAuthenticated) {
      return validUserDetail;
    }

    logger.debug("calling api as details in session are null");
    const response = await axios.get(`${rootPath}/details`);
    const userDetailsResponse = response.data as UserDetailsResource;

    logger.debug("api response =", userDetailsResponse);
    updateUserDetails(response);
    logger.debug("stored user data session");
    validUserDetail = getValidUserDetails(logger);
    if (validUserDetail) {
      return validUserDetail;
    }
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
    status: UserStatus.DELETED_USER
  };
  return dummyUserDetail;
}, getCacheOption("3 sec"));

export const signup = pMemoize(async (details: UserSignupResource) => {
  const logger = getLogger("signup", _logger);
  try {
    if (isAuthenticated(logger)) {
      logger.debug("logged in already");
      throw new Error("You are already logged in.");
    }

    const data = { ...details, password: btoa(details.password) };
    // default configs will be created with sign up
    const response = await axios.post(`${rootPath}/signup`, data);
    updateAuthorizationToken(response);
    pMemoizeClear(getUserDetails);
    logger.debug("stored token session data");

    updateUserDetails({
      data: { ...details, isAuthenticated: true, status: UserStatus.ACTIVE_USER, fullName: "" }
    });
    logger.debug("stored user session data");
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const updateName = pMemoize(async (details: UpdateUserDetailsResource) => {
  const logger = getLogger("updateName", _logger);
  try {
    const response = await axios.post(`${rootPath}/details`, details);

    logger.debug("received response =", response, " overwriting user session data");
    updateNameInDetails(details);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const updatePassword = pMemoize(async (details: UpdateUserPasswordResource) => {
  const logger = getLogger("updatePassword", _logger);
  try {
    // encode before sending over api call
    const data: UpdateUserPasswordResource = {
      password: btoa(details.password),
      newPassword: btoa(details.newPassword)
    };
    const response = await axios.post(`${rootPath}/details`, data);
    logger.debug("received response =", response);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const getTokenExpiryTime = () => {
  const logger = getLogger("getTokenExpiryTime", _logger, null, "DISABLED");
  const validSessionSeconds = getRemainingExpiryTimeInSeconds();
  logger.debug("validSessionSeconds =", validSessionSeconds, ", responding boolean result = ", !(validSessionSeconds <= MARGIN_ERROR_TIME_IN_SEC));
  if (validSessionSeconds > MARGIN_ERROR_TIME_IN_SEC) {
    return validSessionSeconds;
  }

  logger.debug("invalid token session, so time diff is negative");
  return -1;
};

export const refreshToken = pMemoize(async () => {
  const logger = getLogger("refreshToken", _logger);
  try {
    const response = await axios.post(`${rootPath}/refresh`);
    updateAuthorizationToken(response);
    pMemoizeClear(getUserDetails);
    logger.debug("stored refreshed token data to session");
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    logger.debug("clearing session data");
    logout();
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const deleteUserAccount = pMemoize(async (details: UserLoginResource) => {
  const logger = getLogger("deleteUserAccount", _logger);
  try {
    // encode before sending over api call
    const data: UserLoginResource = {
      emailId: details.emailId,
      password: btoa(details.password)
    };
    const response = await axios.delete(`${rootPath}/details`, { headers: { ...data } });
    logger.debug("response =", response);
    deleteUser();
    pMemoizeClear(getUserDetails);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const isUserAccountReadOnly = async () => {
  const logger = getLogger("isUserAccountReadOnly", _logger);
  const userDetails = getValidUserDetails(logger);
  return !!userDetails?.isAuthenticated && userDetails.status !== UserStatus.ACTIVE_USER;
};

export const getCountryList = async () => {
  const usa: CountryResource = { name: "United States of America", code: "USA" };
  return [usa];
};
