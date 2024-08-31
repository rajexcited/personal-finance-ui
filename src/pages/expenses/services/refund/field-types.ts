import { ReceiptProps } from "../../../../components/receipt";
import { AuditFields } from "../../../../shared";
import { ExpenseBelongsTo, ExpenseStatus } from "../expense/field-types";
import { PurchaseFields } from "../purchase";

export interface PurchaseRefundFields {
  id: string;
  billName: string;
  amount: string;
  description: string;
  tags: string[];
  paymentAccountId?: string;
  paymentAccountName?: string;
  refundDate: string | Date;
  receipts: ReceiptProps[];
  status: ExpenseStatus;
  auditDetails: AuditFields;
  belongsTo: ExpenseBelongsTo.PurchaseRefund;
  purchaseId?: string;
  purchaseDetails?: PurchaseFields;
  reasonId: string;
  reasonValue: string;
}
