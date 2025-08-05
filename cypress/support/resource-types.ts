export enum NavBarSelectors {
  SignupNavlink = "#signup-navlink",
  LoginNavlink = "#login-navlink",
  ExpenseNavlink = "#expenses-navlink",
  PaymentAccountNavlink = "#payment-accounts-navlink",
  SettingsNavlink = "#settings-navlink",
  IncomeTypeSettingsNavlink = "#income-type-stngs-navlink",
  PurchaseTypeSettingsNavlink = "#purchase-type-stngs-navlink",
  RefundReasonSettingsNavlink = "#refund-reason-stngs-navlink",
  PaymentAccountTypeSettingsNavlink = "#payment-account-type-stngs-navlink",
  SharePersonSettingsNavlink = "#share-person-stngs-navlink",
  LogoutNavlink = "#logout-navlink"
}

export enum EnvId {
  Local = "local"
}

export type DeviceModeType = "large" | "small";

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
