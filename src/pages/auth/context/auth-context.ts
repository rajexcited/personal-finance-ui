import { createContext } from "react";
import { SignupDetailType } from "../services";

interface AuthContextType {
  fullName: string;
  isAuthenticated: boolean;
  emailId: string;
  login(emailId: string, password: string): Promise<void>;
  logout(): void;
  signup(details: SignupDetailType): Promise<void>;
}

export const defaultAuthContext: AuthContextType = {
  fullName: "",
  isAuthenticated: false,
  emailId: "",
  login: async (name: string, pass: string) => {},
  logout: () => {},
  signup: async (details: SignupDetailType) => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export default AuthContext;
