import { ExpenseBelongsTo } from "../../pages/expenses/services";

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
  relationId: string;
  belongsTo: ExpenseBelongsTo;
}

export type ErrorReceiptProps = ReceiptProps & { error: Error };
type DownloadReceiptResourceError = Pick<ReceiptProps, "id" | "relationId" | "belongsTo"> & { error: string; status: "fail" };
type DownloadReceiptResourceSuccess = Required<Pick<ReceiptProps, "id" | "relationId" | "url" | "belongsTo"> & { status: "success" }>;
export type DownloadReceiptResource = DownloadReceiptResourceSuccess | DownloadReceiptResourceError;

export enum CacheAction {
  AddUpdateGet = "AddUpdateGet",
  Remove = "Remove",
}
