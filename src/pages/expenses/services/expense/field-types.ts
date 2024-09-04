import { PurchaseRefundFields } from "../refund/field-types";
import { PurchaseFields } from "../purchase/field-types";
import { IncomeFields } from "../income/field-types";

/** expense is treated as parent type. the same status can be applied to all sub-types */
export enum ExpenseStatus {
  Enable = "enable",
  Deleted = "deleted",
}

export enum ExpenseBelongsTo {
  Purchase = "purchase",
  Income = "income",
  // Investment = "investment",
  PurchaseRefund = "purchase-refund",
}

export type ExpenseFields = PurchaseFields | PurchaseRefundFields | IncomeFields;
