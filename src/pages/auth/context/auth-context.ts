import { createContext } from "react";
import { UserDetailsResource, UserSignupResource, UserStatus } from "../services";

interface AuthContextInfo {
  userDetails: UserDetailsResource;
  readOnly: boolean;
  login(emailId: string, password: string, forceLogin: boolean): Promise<void>;
  logout(): Promise<void>;
  signup(details: UserSignupResource): Promise<void>;
  validateExpiryStatusOnLocationChange(): void;
}

export const dummyUserDetails: UserDetailsResource = {
  id: "",
  emailId: "",
  firstName: "",
  lastName: "",
  fullName: "",
  isAuthenticated: false,
  status: UserStatus.DEACTIVATED_USER
};

const defaultAuthContext: AuthContextInfo = {
  userDetails: { ...dummyUserDetails },
  readOnly: true,
  login: async (_id: string, _pass: string, _forceLogin: boolean) => {
    /* do nothing */
  },
  logout: async () => {
    /* do nothing */
  },
  signup: async (_details: UserSignupResource) => {
    /* do nothing */
  },
  validateExpiryStatusOnLocationChange: () => {}
};

const AuthContext = createContext<AuthContextInfo>(defaultAuthContext);

export default AuthContext;
