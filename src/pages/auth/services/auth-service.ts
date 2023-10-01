import axios from "axios";
import { REST_ROOT_PATH, ConfigTypeService, ConfigTypeStatus } from "../../../services";
import dateutils from "date-and-time";

export interface AuthDetailType {
  roles: string[];
  userName: string;
  isAuthenticated: boolean;
  fullName: string;
  expiryDate: Date;
}

export interface LoginDataType {
  userName: string;
  password: string;
}

export interface UserDetailType {
  userName: string;
  fullName: string;
  isAuthenticated: boolean;
  expiryDate: Date;
}

interface AuthenticationService {
  login(details: LoginDataType): Promise<void>;
  isAuthenticated(): boolean;
  logout(): void;
  isAuthorized(pageid: string): Promise<boolean>;
  destroy(): void;
  getUserDetails(): UserDetailType;
}

const AuthenticationServiceImpl = (): AuthenticationService => {
  const authRoleConfigService = ConfigTypeService("auth");
  const authSessionKey = "fin-auth";

  const login = async (details: LoginDataType) => {
    try {
      const data = { userName: details.userName, password: details.password };
      const response = await axios.post(REST_ROOT_PATH + "/login", data, { withCredentials: true });
      const authResponse: AuthDetailType = {
        ...response.data,
        expiryDate: dateutils.addSeconds(new Date(), response.data.expiresIn),
      };

      const authDetails = {
        ...authResponse,
        expiryDate: authResponse.expiryDate.getTime(),
      };
      sessionStorage.setItem(authSessionKey, JSON.stringify(authDetails));
    } catch (e) {
      // handleRestErrors(e as Error);
      console.error("not rest error", e);
      // throw e;
      sessionStorage.setItem(
        authSessionKey,
        JSON.stringify({
          roles: ["role1"],
          userName: "neel4ever@gmail.com",
          isAuthenticated: true,
          fullName: "Neel Sheth",
          expiryDate: dateutils.addSeconds(new Date(), 2 * 60).getTime(),
        })
      );
    }
  };

  const getValidAuthSessionDetails = () => {
    const sessionDetails = sessionStorage.getItem(authSessionKey);
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
    sessionStorage.removeItem(authSessionKey);
  };

  const getUserDetails = (): UserDetailType => {
    const authDetails = getValidAuthSessionDetails();
    if (authDetails) {
      return {
        fullName: authDetails.fullName,
        isAuthenticated: authDetails.isAuthenticated,
        userName: authDetails.userName,
        expiryDate: authDetails.expiryDate,
      };
    }
    return {
      fullName: "",
      userName: "",
      isAuthenticated: false,
      expiryDate: dateutils.parse("1/1/1000", "m/d/yyyy"),
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
  };
};

export default AuthenticationServiceImpl;
