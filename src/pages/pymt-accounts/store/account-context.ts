import { createContext } from "react";
import { PymtAccountFields } from "./state/field-types";

interface AccountContextObject {
  accounts: PymtAccountFields[];
}

export const AccountContext = createContext<AccountContextObject>({ accounts: [] });
