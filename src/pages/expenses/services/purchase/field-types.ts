import { ReceiptProps } from "../../../../components/receipt";
import { AuditFields } from "../../../../shared";
import { ExpenseBelongsTo, ExpenseStatus } from "../expense/field-types";

interface BasePurchaseFields {
  id: string;
  billName: string;
  amount?: string;
  description: string;
  tags: string[];
  purchaseTypeId?: string;
  purchaseTypeName?: string;
}

export interface PurchaseItemFields extends BasePurchaseFields {}

export interface PurchaseFields extends BasePurchaseFields {
  paymentAccountId?: string;
  paymentAccountName?: string;
  purchasedDate: string | Date;
  verifiedTimestamp?: Date | string;
  items?: PurchaseItemFields[];
  receipts: ReceiptProps[];
  status?: ExpenseStatus;
  auditDetails: AuditFields;
  belongsTo: ExpenseBelongsTo.Purchase;
}
