import { createContext } from "react";

interface AuthContextType {
  fullName: string;
  isAuthenticated: boolean;
  userName: string;
  login(userName: string, password: string): Promise<void>;
  logout(): void;
}

export const defaultAuthContext: AuthContextType = {
  fullName: "",
  isAuthenticated: false,
  userName: "",
  login: async (name: string, pass: string) => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export default AuthContext;
