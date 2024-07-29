import { AuditFields } from "../../../services";

interface BaseExpenseFields {
  id: string;
  billName: string;
  amount?: string;
  description: string;
  tags: string[];
  expenseCategoryId?: string;
  expenseCategoryName?: string;
}

export interface ExpenseItemFields extends BaseExpenseFields {}

export enum ReceiptType {
  PNG = "image/png",
  JPEG = "image/jpeg",
  PDF = "application/pdf",
}

export enum ExpenseStatus {
  Enable = "enable",
  Deleted = "deleted",
}

export interface ReceiptProps {
  file?: File;
  name: string;
  id: string;
  contentType: ReceiptType;
  url?: string;
  expenseId: string;
}

export type ErrorReceiptProps = ReceiptProps & { error: Error };
type DownloadReceiptResourceError = Pick<ReceiptProps, "id" | "expenseId"> & { error: string; status: "fail" };
type DownloadReceiptResourceSuccess = Required<Pick<ReceiptProps, "id" | "expenseId" | "url"> & { status: "success" }>;
export type DownloadReceiptResource = DownloadReceiptResourceSuccess | DownloadReceiptResourceError;

export interface ExpenseFields extends BaseExpenseFields {
  paymentAccountId?: string;
  paymentAccountName?: string;
  purchasedDate: string | Date;
  verifiedTimestamp?: Date | string;
  expenseItems?: ExpenseItemFields[];
  receipts: ReceiptProps[];
  status?: ExpenseStatus;
  auditDetails: AuditFields;
}

export const ExpenseDataFilterItems = [
  "expenseId",
  "billname",
  "amount",
  "pymtacc",
  "description",
  "purchasedDate",
  "tags",
  "verifiedDateTime",
  "categoryId",
  "categoryName",
];

export const FilterActions = ["equals", "greater than", "less than", "contains", "not equals", "not greater than", "not less than", "not contains"];

export interface ExpenseFilterType {
  fieldName: keyof typeof ExpenseDataFilterItems;
  value: string;
  action: keyof typeof FilterActions;
}
