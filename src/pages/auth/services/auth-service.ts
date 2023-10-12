import "./interceptors";
import { axios, ConfigTypeService, ConfigTypeStatus, handleRestErrors } from "../../../services";
import dateutils from "date-and-time";
import { LoginDataType, UserDetailType, SignupDetailType, AuthDetailType } from "./field-types";
import { authTokenSessionKey, authUserSessionKey } from "./refresh-token";

interface AuthenticationService {
  login(details: LoginDataType): Promise<void>;
  isAuthenticated(): boolean;
  logout(): void;
  isAuthorized(pageid: string): Promise<boolean>;
  destroy(): void;
  getUserDetails(): UserDetailType;
  signup(details: SignupDetailType): Promise<void>;
  ping(): void;
}

const AuthenticationServiceImpl = (): AuthenticationService => {
  const authRoleConfigService = ConfigTypeService("auth");

  const login = async (details: LoginDataType) => {
    try {
      const data = { emailId: details.emailId, password: details.password };
      const response = await axios.post("/login", data, { withCredentials: true });
      if (!(response.data.accessToken && response.data.expiresIn)) {
        throw Error("user login unauthorized");
      }
      sessionStorage.setItem(
        authTokenSessionKey,
        JSON.stringify({ accessToken: response.data.accessToken, expiresIn: response.data.expiresIn })
      );
      const authResponse: AuthDetailType = {
        ...response.data,
        accessToken: undefined,
        fullName: response.data.firstname + " " + response.data.lastname,
        expiryDate: dateutils.addSeconds(new Date(), response.data.expiresIn),
      };

      const authDetails = {
        ...authResponse,
        expiryDate: authResponse.expiryDate.getTime(),
      };
      sessionStorage.setItem(authUserSessionKey, JSON.stringify(authDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err);
      console.error("not rest error", e);
      const msg = err.message || e;
      throw Error(msg as string);
    }
  };

  const getValidAuthSessionDetails = () => {
    const sessionDetails = sessionStorage.getItem(authUserSessionKey);
    if (sessionDetails) {
      const parsedDetails = JSON.parse(sessionDetails);
      if (parsedDetails.expiryDate > new Date()) {
        const authDetails: AuthDetailType = {
          ...parsedDetails,
          expiryDate: new Date(parsedDetails.expiryDate),
        };
        return authDetails;
      }
    }
    sessionStorage.removeItem(authUserSessionKey);
    return null;
  };

  const isAuthenticated = (): boolean => {
    try {
      const authDetails = getValidAuthSessionDetails();
      return !!authDetails;
    } catch (e) {
      console.error("unknown error", e);
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(authUserSessionKey);
    sessionStorage.removeItem(authTokenSessionKey);
    axios.post("/logout", { withCredentials: true });
  };

  const getUserDetails = (): UserDetailType => {
    const authDetails = getValidAuthSessionDetails();
    if (authDetails) {
      return {
        fullName: authDetails.fullName,
        isAuthenticated: authDetails.isAuthenticated,
        emailId: authDetails.emailId,
        expiryDate: authDetails.expiryDate,
      };
    }
    return {
      fullName: "",
      emailId: "",
      isAuthenticated: false,
      expiryDate: dateutils.parse("1/1/1000", "M/D/YYYY"),
    };
  };

  const isAuthorized = async (pageid: string): Promise<boolean> => {
    const authDetails = getValidAuthSessionDetails();
    if (authDetails) {
      const authConfigs = await authRoleConfigService.getConfigTypes([ConfigTypeStatus.enable]);
      const authRoleCfgs = authConfigs.filter((cfg) => cfg.relations.includes("auth-roles"));
      const authRoleMatched = authRoleCfgs
        .filter((cfg) => cfg.value === pageid)
        .find((cfg) => authDetails.roles.includes(cfg.name));
      return !!authRoleMatched;
    }
    return false;
  };

  const signup = async (details: SignupDetailType) => {
    if (isAuthenticated()) {
      throw new Error("You are already logged in. Cannot sing you up.");
    }
    try {
      const data = { ...details };
      // default configs will be created with sign up
      const response = await axios.post("/signup", data, { withCredentials: true });
      if (!(response.data.accessToken && response.data.expiresIn)) {
        throw Error("user login unauthorized");
      }
      sessionStorage.setItem(
        authTokenSessionKey,
        JSON.stringify({ accessToken: response.data.accessToken, expiresIn: response.data.expiresIn })
      );
      const authResponse: AuthDetailType = {
        ...response.data,
        accessToken: undefined,
        fullName: response.data.firstname + " " + response.data.lastname,
        expiryDate: dateutils.addSeconds(new Date(), response.data.expiresIn),
      };

      const authDetails = {
        ...authResponse,
        isAuthenticated: true,
        expiryDate: authResponse.expiryDate.getTime(),
      };
      sessionStorage.setItem(authUserSessionKey, JSON.stringify(authDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err);
      console.error("not rest error", e);
      const msg = err.message || e;
      throw Error(msg as string);
    }
  };

  const ping = async () => {
    axios.get("/health/ping");
  };

  const destroy = () => {
    authRoleConfigService.destroy();
  };

  return {
    login,
    logout,
    isAuthenticated,
    isAuthorized,
    getUserDetails,
    destroy,
    signup,
    ping,
  };
};

export default AuthenticationServiceImpl;
