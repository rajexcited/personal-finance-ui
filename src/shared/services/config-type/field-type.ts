import { AuditFields } from "../audit-fields";

export interface ConfigResource {
  id: string;
  value: string;
  name: string;
  belongsTo: ConfigTypeBelongsTo;
  description: string;
  status: ConfigTypeStatus;
  color?: string;
  tags: string[];
  auditDetails: AuditFields;
}

export type UpdateConfigStatusResource = Pick<ConfigResource, "status" | "id"> & { action: "updateStatus" };
export type UpdateConfigDetailsResource = ConfigResource & { action: "addUpdateDetails" };
export type DeleteConfigDetailsResource = ConfigResource & { action: "deleteDetails" };

export enum ConfigTypeStatus {
  Enable = "enable",
  Disable = "disable",
  Deleted = "deleted",
}

export enum ConfigTypeBelongsTo {
  PurchaseType = "purchase-type",
  RefundReason = "refund-reason",
  PaymentAccountType = "pymt-account-type",
  CurrencyProfile = "currency-profile",
  IncomeType = "income-type",
}
