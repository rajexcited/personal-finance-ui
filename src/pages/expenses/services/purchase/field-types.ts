import { AuditFields } from "../../../../services";
import { ExpenseStatus } from "../field-types";

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

export enum ReceiptType {
  PNG = "image/png",
  JPEG = "image/jpeg",
  PDF = "application/pdf",
}

export interface ReceiptProps {
  file?: File;
  name: string;
  id: string;
  contentType: ReceiptType;
  url?: string;
  purchaseId: string;
}

export type ErrorReceiptProps = ReceiptProps & { error: Error };
type DownloadReceiptResourceError = Pick<ReceiptProps, "id" | "purchaseId"> & { error: string; status: "fail" };
type DownloadReceiptResourceSuccess = Required<Pick<ReceiptProps, "id" | "purchaseId" | "url"> & { status: "success" }>;
export type DownloadReceiptResource = DownloadReceiptResourceSuccess | DownloadReceiptResourceError;

export interface PurchaseFields extends BasePurchaseFields {
  paymentAccountId?: string;
  paymentAccountName?: string;
  purchasedDate: string | Date;
  verifiedTimestamp?: Date | string;
  items?: PurchaseItemFields[];
  receipts: ReceiptProps[];
  status?: ExpenseStatus;
  auditDetails: AuditFields;
}
