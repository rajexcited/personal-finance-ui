import { PurchaseFields } from "./purchase/field-types";

/** expense is treated as parent type. the same status can be applied to all sub-types */
export enum ExpenseStatus {
  Enable = "enable",
  Deleted = "deleted",
}

export enum ExpenseBelongsTo {
  Purchase = "purchase",
  Income = "income",
  Investment = "investment",
}

export type ExpenseFields = PurchaseFields;
