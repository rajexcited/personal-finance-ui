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
  id: string;
  belongsTo: ConfigBelongsTo;
  name: string;
  status: ConfigStatus;
  description: string;
  tags: string[];
  auditDetails: AuditDetailsType;
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

export enum ExpenseStatus {
  ENABLE = "enable",
  DISABLE = "disable",
  DELETED = "deleted"
}

export enum ExpenseBelongsTo {
  Purchase = "purchase",
  Income = "income",
  Investment = "investment",
  Refund = "refund"
}

export enum ReceiptContentType {
  PNG = "image/png",
  JPG = "image/jpeg",
  PDF = "application/pdf"
}

export interface ApiResourceReceipt {
  id: string;
  name: string;
  contentType: ReceiptContentType;
  relationId: string;
  belongsTo: ExpenseBelongsTo;
}

interface ApiResourceExpense {
  id: string;
  billName: string;
  description: string;
  tags: string[];
  verifiedTimestamp?: string;
  belongsTo: ExpenseBelongsTo;
  receipts: ApiResourceReceipt[];
  auditDetails: AuditDetailsType;
  status: ExpenseStatus;
  personIds: string[];
  profileId: string;
}

export interface ApiResourcePurchaseItemDetails {
  id: string;
  billName: string;
  amount: string;
  description: string;
  tags: string[];
  purchaseTypeId?: string;
}

export interface ApiResourcePurchaseDetails extends ApiResourceExpense {
  belongsTo: ExpenseBelongsTo.Purchase;
  amount: string;
  description: string;
  purchaseTypeId: string;
  paymentAccountId: string;
  purchaseDate: string;
  items: ApiResourcePurchaseItemDetails[];
}
