import { createContext } from "react";
import { UserDetailsResource, UserSignupResource } from "../services";

interface AuthContextInfo {
  userDetails: UserDetailsResource;
  login(emailId: string, password: string): Promise<void>;
  logout(): Promise<void>;
  signup(details: UserSignupResource): Promise<void>;
}

export const dummyUserDetails = { emailId: "", firstName: "", lastName: "", fullName: "", isAuthenticated: false };

const defaultAuthContext: AuthContextInfo = {
  userDetails: { ...dummyUserDetails },
  login: async (id: string, pass: string) => {
    /* do nothing */
  },
  logout: async () => {
    /* do nothing */
  },
  signup: async (details: UserSignupResource) => {
    /* do nothing */
  },
};

const AuthContext = createContext<AuthContextInfo>(defaultAuthContext);

export default AuthContext;
