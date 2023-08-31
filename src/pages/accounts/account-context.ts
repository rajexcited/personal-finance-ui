import { createContext } from "react";
import { AccountFields } from "./accounts-type";

export const AccountContext = createContext<AccountFields[]>([]);
