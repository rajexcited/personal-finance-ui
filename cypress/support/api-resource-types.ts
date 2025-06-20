interface AuditDetailsType {
  createdOn: string | Date;
  updatedOn: string | Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export type PaymentAccountStatus = "enable" | "deleted" | "immutable";

export interface ApiPaymentAccountResource {
  id: string;
  shortName: string;
  accountIdNum?: string;
  typeId: string;
  tags: string[];
  institutionName?: string;
  description: string;
  status: PaymentAccountStatus;
  auditDetails: AuditDetailsType;
  currencyProfileId: string;
}

export type ConfigStatus = "enable" | "disable" | "deleted";

export enum ConfigBelongsTo {
  PurchaseType = "purchase-type",
  PaymentAccountType = "pymt-account-type",
  CurrencyProfile = "currency-profile",
  IncomeType = "income-type",
  RefundReason = "refund-reason",
  InvestmentType = "investment-type",
  SharePerson = "share-person"
}

export interface ApiConfigTypeResource {
  id?: string;
  belongsTo: ConfigBelongsTo;
  name: string;
  status: ConfigStatus;
  description?: string;
  tags: string[];
  auditDetails?: AuditDetailsType;
  value: string;
}

export interface ApiCurrencyProfileResource extends ApiConfigTypeResource {
  country: {
    name: string;
    code: string;
  };
  currency: {
    name: string;
    code: string;
    symbol: string;
  };
}
