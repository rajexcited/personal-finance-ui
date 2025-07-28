export enum NavBarSelectors {
  SignupNavlink = "#signup-navlink",
  LoginNavlink = "#login-navlink",
  ExpenseNavlink = "#expenses-navlink",
  PaymentAccountNavlink = "#payment-accounts-navlink",
  SettingsNavlink = "#settings-navlink",
  IncomeTypeSettingsNavlink = "#income-type-stngs-navlink",
  LogoutNavlink = "#logout-navlink"
}

export enum EnvId {
  Local = "local"
}

export enum DeviceWidth {
  Large = "large",
  Medium = "medium",
  Small = "small"
}

export class UnSupportedError extends Error {
  public name = "UnSupportedError";
  constructor(message: string) {
    super(message);
  }
}

export interface UpdateRefOptions {
  existingRef: string;
  updatingRef: string;
}
