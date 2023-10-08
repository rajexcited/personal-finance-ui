import { axios, ConfigTypeService, ConfigTypeStatus, handleRestErrors } from "../../../services";
import dateutils from "date-and-time";

export interface AuthDetailType {
  roles: string[];
  emailId: string;
  isAuthenticated: boolean;
  fullName: string;
  expiryDate: Date;
  firstname: string;
  lastname: string;
}

export interface LoginDataType {
  emailId: string;
  password: string;
}

export interface SignupDetailType {
  emailId: string;
  password: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

export interface UserDetailType {
  emailId: string;
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
  signup(details: SignupDetailType): Promise<void>;
}

const AuthenticationServiceImpl = (): AuthenticationService => {
  const authRoleConfigService = ConfigTypeService("auth");
  const authSessionKey = "fin-auth";

  const login = async (details: LoginDataType) => {
    try {
      const data = { emailId: details.emailId, password: details.password };
      const response = await axios.post("/login", data, { withCredentials: true });
      const authResponse: AuthDetailType = {
        ...response.data,
        fullName: response.data.firstname + " " + response.data.lastname,
        expiryDate: dateutils.addSeconds(new Date(), response.data.expiresIn),
      };

      const authDetails = {
        ...authResponse,
        expiryDate: authResponse.expiryDate.getTime(),
      };
      sessionStorage.setItem(authSessionKey, JSON.stringify(authDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err);
      console.error("not rest error", e);
      const msg = err.message || e;
      throw Error(msg as string);
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

  const signup = async (details: SignupDetailType) => {
    if (isAuthenticated()) {
      throw new Error("You are already logged in. Cannot sing you up.");
    }
    try {
      const data = { ...details };
      // default configs will be created with sign up
      const response = await axios.post("/signup", data, { withCredentials: true });
      const authResponse: AuthDetailType = {
        ...response.data,
        fullName: response.data.firstname + " " + response.data.lastname,
        expiryDate: dateutils.addSeconds(new Date(), response.data.expiresIn),
      };

      const authDetails = {
        ...authResponse,
        isAuthenticated: true,
        expiryDate: authResponse.expiryDate.getTime(),
      };
      sessionStorage.setItem(authSessionKey, JSON.stringify(authDetails));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err);
      console.error("not rest error", e);
      const msg = err.message || e;
      throw Error(msg as string);
    }
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
  };
};

export default AuthenticationServiceImpl;
