import { AuditFields } from "../../../services";

interface BaseExpenseFields extends AuditFields {
  id?: string;
  expenseId: string;
  billname: string;
  amount?: string;
  description: string;
  tags: string;
  categoryId?: string;
  categoryName?: string;
}

export interface ExpenseItemFields extends BaseExpenseFields {
  parentExpenseId: string;
}

export enum ReceiptType {
  PNG = "image/png",
  JPEG = "image/jpeg",
  PDF = "application/pdf",
}

export interface ReceiptProps {
  file?: File;
  error?: string;
  fileName: string;
  lastUpdatedDate: Date;
  fileType: ReceiptType;
  id: string;
  url: string;
}

export interface ExpenseFields extends BaseExpenseFields {
  pymtaccId?: string;
  pymtaccName?: string;
  purchasedDate: Date;
  verifiedDateTime?: Date;
  expenseItems: ExpenseItemFields[];
  receipts: ReceiptProps[];
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

export const FilterActions = [
  "equals",
  "greater than",
  "less than",
  "contains",
  "not equals",
  "not greater than",
  "not less than",
  "not contains",
];

export interface ExpenseFilterType {
  fieldName: keyof typeof ExpenseDataFilterItems;
  value: string;
  action: keyof typeof FilterActions;
}
