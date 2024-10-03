import { ReceiptProps } from "../../../../components/receipt";
import { AuditFields } from "../../../../shared";
import { ExpenseBelongsTo, ExpenseStatus } from "../expense/field-types";

export interface IncomeFields {
  id: string;
  billName: string;
  amount: string;
  description: string;
  tags: string[];
  paymentAccountId?: string;
  paymentAccountName?: string;
  incomeDate: string | Date;
  receipts: ReceiptProps[];
  status: ExpenseStatus;
  auditDetails: AuditFields;
  belongsTo: ExpenseBelongsTo.Income;
  incomeTypeId: string;
  incomeTypeName: string;
  personIds: string[];
}
