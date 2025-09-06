import pMemoize, { pMemoizeClear } from "p-memoize";
import { AxiosResponse, AxiosResponseHeaders } from "axios";
import ms, { StringValue } from "ms";
import { capitalize } from "lodash";
import { AccessTokenResource, UpdateUserDetailsResource, UserDetailsResource, UserStatus } from "./field-types";
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// to avoid circular dependency importing from specific files
////////////////////////////////////////////////////////////////////////////////////////////////////////
import { getCacheOption, getCacheOptionWithKey, pMemoizeSync, pMemoizeSyncClear } from "../../../shared/utils/cache-utils";
import { getLogger, LoggerBase } from "../../../shared/utils/logger";
import { AuditFields } from "../../../shared/services/audit-fields";
import { subtractDatesDefaultToZero } from "../../../shared/utils/date-utils";
import { UnauthorizedError } from "../../../shared/utils/rest-error-utils";
import { isBlank } from "../../../shared/utils/string-utils";

// user logged in flag
const userLoggedInKey = "ul";
const userLoggedInValue = "true";
const storeLogger = getLogger("service.store.auth", null, null, "DISABLED");

const MIN_SESSION_TIME_IN_SEC = ms(import.meta.env.VITE_MINIMUM_SESSION_TIME as StringValue) / 1000;

interface AuthStore {
  token: AccessTokenResource & AuditFields;
  userDetails: UserDetailsResource & AuditFields;
}
const authStore: AuthStore = {
  token: {
    accessToken: "",
    expiryTime: Date.now(),
    createdOn: new Date(),
    updatedOn: new Date()
  },
  userDetails: {
    emailId: "",
    firstName: "",
    lastName: "",
    fullName: "",
    isAuthenticated: false,
    status: UserStatus.PUBLIC_USER,
    createdOn: new Date(),
    updatedOn: new Date()
  }
};

storeLogger.debug("initialized to default values. authStore=", authStore);

export const getAuthorizationToken = pMemoize(async () => {
  const logger = getLogger("getAuthorizationToken", storeLogger);
  cleanupSessionIfNeed();
  if (authStore.token.accessToken && subtractDatesDefaultToZero(authStore.token.expiryTime).toSeconds().value > 0) {
    logger.debug("found valid accesstoken");
    return authStore.token.accessToken;
  }
  logger.debug("invalid access token");
  throw new UnauthorizedError("missing access token");
}, getCacheOption("10 sec"));

export const getRemainingExpiryTimeInSeconds = pMemoizeSync(() => {
  const logger = getLogger("getRemainingExpiryTimeInSeconds", storeLogger);
  const result = subtractDatesDefaultToZero(authStore.token.expiryTime).toSeconds().value;
  logger.debug("expiryTime, result=", result);
  return result;
}, getCacheOptionWithKey("1 sec", "getRemainingExpiryTimeInSeconds"));

const cleanupSessionIfNeed = () => {
  if (!isUserLoggedIn() && authStore.token.accessToken) {
    cleanupSession();
  }
};
export const cleanupSession = pMemoizeSync(() => {
  resetTokenSession();
  resetUserSession();
  sessionStorage.removeItem(userLoggedInKey);
}, getCacheOptionWithKey("5 sec", "cleanupSession"));

const resetTokenSession = () => {
  const logger = getLogger("resetTokenSession", storeLogger);
  logger.debug("clearing accesstoken value and updating audit fields");
  authStore.token.accessToken = "";
  authStore.token.expiryTime = new Date().getTime();
  authStore.token.updatedOn = new Date();
  authStore.token.createdOn = new Date();
  logger.debug("updated");
};

const resetUserSession = () => {
  const logger = getLogger("resetUserSession", storeLogger);
  logger.debug("clearing user details session and updating audit fields");
  authStore.userDetails.emailId = "";
  authStore.userDetails.firstName = "";
  authStore.userDetails.lastName = "";
  authStore.userDetails.fullName = "";
  authStore.userDetails.isAuthenticated = false;
  authStore.userDetails.status = UserStatus.PUBLIC_USER;
  authStore.userDetails.updatedOn = new Date();
  authStore.userDetails.createdOn = new Date();
  logger.debug("updated");
};

const isUserLoggedIn = () => {
  return sessionStorage.getItem(userLoggedInKey) === userLoggedInValue;
};
const validateUserLoggedIn = () => {
  if (!isUserLoggedIn()) {
    throw new Error("update user details is not authorized");
  }
};

const getHeaderValue = (responseHeader: AxiosResponseHeaders, hKey: string) => {
  let hValue = responseHeader.get(hKey);
  if (!hValue) {
    // aws api gateway automatically re-maps header
    hValue = responseHeader.get("x-amzn-remapped-" + hKey);
  }
  return hValue;
};

export const updateAuthorizationToken = (response: AxiosResponse<AccessTokenResource, any>) => {
  const logger = getLogger("updateAuthorizationToken", storeLogger);
  let accessToken = null;
  logger.debug("response arg", response);
  const responseHeader = response.headers as AxiosResponseHeaders;
  accessToken = getHeaderValue(responseHeader, "Authorization");
  logger.debug("attempted to retrieve accesstoken from response header. value=", accessToken);
  if (typeof accessToken === "string" && response.data.expiresIn && response.data.expiryTime) {
    if (
      response.data.expiresIn >= MIN_SESSION_TIME_IN_SEC &&
      subtractDatesDefaultToZero(response.data.expiryTime).toSeconds().value >= MIN_SESSION_TIME_IN_SEC
    ) {
      logger.debug("found valid response");
      authStore.token.accessToken = accessToken;
      authStore.token.expiresIn = response.data.expiresIn;
      authStore.token.expiryTime = response.data.expiryTime;
      authStore.token.updatedOn = new Date();
      sessionStorage.setItem(userLoggedInKey, userLoggedInValue);
      pMemoizeClear(getAuthorizationToken);
      pMemoizeSyncClear(getRemainingExpiryTimeInSeconds);
      return;
    }
  }
  logger.debug("incorrect auth response");
  throw Error("user not authorized");
};

export const getValidUserDetails = (loggerBase: LoggerBase) => {
  const logger = getLogger("getValidUserDetails", loggerBase, storeLogger);

  cleanupSessionIfNeed();

  if (getRemainingExpiryTimeInSeconds() > 1 && authStore.userDetails.isAuthenticated) {
    return authStore.userDetails;
  }
  return null;
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
  return capitalize(lastName) + ", " + capitalize(firstName);
};

export const updateUserDetails = (response: AxiosResponse<UserDetailsResource, any> | Record<"data", UserDetailsResource>) => {
  const logger = getLogger("updateUserDetails", storeLogger);
  validateUserLoggedIn();
  if (isBlank(response.data.emailId)) {
    throw new Error("missing emailId in response");
  }
  if (isBlank(response.data.firstName)) {
    throw new Error("missing firstName in response");
  }
  if (isBlank(response.data.lastName)) {
    throw new Error("missing lastName in response");
  }
  logger.debug("valid response to update");
  authStore.userDetails.emailId = response.data.emailId;
  authStore.userDetails.firstName = response.data.firstName;
  authStore.userDetails.lastName = response.data.lastName;
  authStore.userDetails.isAuthenticated = true;
  authStore.userDetails.fullName = getFullName(response.data.firstName, response.data.lastName);
  authStore.userDetails.status = response.data.status;
  authStore.userDetails.createdOn = new Date();
  authStore.userDetails.updatedOn = new Date();
};

export const updateNameInDetails = (response: UpdateUserDetailsResource) => {
  const logger = getLogger("updateNameInDetails", storeLogger);
  validateUserLoggedIn();
  if (isBlank(response.firstName)) {
    throw new Error("missing firstName in response");
  }
  if (isBlank(response.lastName)) {
    throw new Error("missing lastName in response");
  }
  logger.debug("valid response to update");
  authStore.userDetails.firstName = response.firstName;
  authStore.userDetails.lastName = response.lastName;
  authStore.userDetails.fullName = getFullName(response.firstName, response.lastName);
  authStore.userDetails.updatedOn = new Date();
};

export const deleteUser = () => {
  const logger = getLogger("deleteUser", storeLogger);
  validateUserLoggedIn();
  authStore.userDetails.status = UserStatus.DELETED_USER;
  authStore.userDetails.updatedOn = new Date();
  logger.debug("user status is updated");
};

const getUserDetailsJsonString = () => {
  const logger = getLogger("getUserDetailsJsonString", storeLogger);
  const details = {
    isAuthenticated: authStore.userDetails.isAuthenticated,
    status: authStore.userDetails.status,
    createdOn: (authStore.userDetails.createdOn as Date).getTime()
  };
  logger.debug("partial user details");
  return JSON.stringify(details);
};

const populateUserDetailsFromJsonString = (json: string) => {
  const logger = getLogger("populateUserDetailsFromJsonString", storeLogger);
  logger.debug("attempting to populate user details on page loads/reloads");
  try {
    const user = JSON.parse(json);
    if (
      user &&
      typeof user.isAuthenticated === "boolean" &&
      [UserStatus.ACTIVE_USER, UserStatus.DEACTIVATED_USER, UserStatus.DELETED_USER].includes(user.status)
    ) {
      logger.debug("found valid user after load/reload, updating");
      authStore.userDetails.isAuthenticated = user.isAuthenticated;
      authStore.userDetails.status = user.status;
      authStore.userDetails.updatedOn = new Date();
      authStore.userDetails.createdOn = new Date(user.createdOn);
    }
  } catch (e) {
    logger.debug("unable to retrieve user", e);
  }
};

const partKeyList = ["po", "pt", "pf", "ps", "pe"];
const getTokenDetailsJsonString = () => {
  const logger = getLogger("getTokenDetailsJsonString", storeLogger);
  try {
    if (subtractDatesDefaultToZero(authStore.token.expiryTime).toSeconds().value >= 10) {
      const parts = authStore.token.accessToken.split(".");
      const pobj = partKeyList.reduce((obj: Record<string, string>, kk, i) => {
        obj[kk] = btoa(parts[i]);
        return obj;
      }, {});
      const details = {
        ...pobj,
        expiryTime: authStore.token.expiryTime,
        expiresIn: authStore.token.expiresIn,
        createdOn: (authStore.token.createdOn as Date).getTime()
      };
      logger.debug("found valid token. to be reuse after reload");
      return JSON.stringify(details);
    }
  } catch (e) {
    logger.error("error to get token json", e);
  }
  logger.debug("not valid token");
  return null;
};

const populateTokenDetailsFromJsonString = (json: string) => {
  const logger = getLogger("populateTokenDetailsFromJsonString", storeLogger);
  try {
    const tokendetails = JSON.parse(json);
    if (tokendetails) {
      logger.debug("valid token json obj", tokendetails);
      authStore.token.accessToken = partKeyList
        .map((pk) => {
          if (tokendetails[pk]) {
            return atob(tokendetails[pk]);
          }
          return undefined;
        })
        .filter((val) => val !== String(undefined))
        .join(".");
      logger.debug("formatted accesstoken. now saving to determine whether user is public or logged in");
      authStore.token.expiresIn = tokendetails.expiresIn;
      authStore.token.expiryTime = tokendetails.expiryTime;
      authStore.token.createdOn = new Date(tokendetails.createdOn);
      authStore.token.updatedOn = new Date();
    }
  } catch (e) {
    logger.error("unable to retrieve token");
  }
};

const reloadHandlerWhileLoggedIn = () => {
  const usrkey = "fin-usr";
  const tknkey = "fin-tkn";
  const logger = getLogger("reloadHandlerWhileLoggedIn", storeLogger);
  window.addEventListener("beforeunload", (event) => {
    const logg = getLogger("window.event.beforeunload", logger);
    logg.debug("before reload, saving item details");
    const tokenjson = getTokenDetailsJsonString();
    const userjson = getUserDetailsJsonString();
    if (tokenjson && userjson) {
      logg.debug("retrieved both valid token and valid user details, saving to temp storage");
      sessionStorage.setItem(tknkey, btoa(tokenjson));
      sessionStorage.setItem(usrkey, btoa(userjson));
    } else {
      logg.debug("valid token and user details are not found. not storing any values to storage.");
    }
  });

  try {
    const token = sessionStorage.getItem(tknkey) as string;
    sessionStorage.removeItem(tknkey);
    logger.debug("after reload, saved token details", token);
    populateTokenDetailsFromJsonString(atob(token));
  } catch (e) {
    logger.error("unable to parse token session", e);
  }

  try {
    const user = sessionStorage.getItem(usrkey) as string;
    sessionStorage.removeItem(usrkey);
    logger.debug("after reload, saved user details", user);
    populateUserDetailsFromJsonString(atob(user));
  } catch (e) {
    logger.error("unable to parse token session", e);
  }
};

reloadHandlerWhileLoggedIn();
