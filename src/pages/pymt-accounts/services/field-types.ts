import { AuditFields } from "../../../shared";

export enum PymtAccStatus {
  Enable = "enable",
  Deleted = "deleted",
}

export interface PymtAccountFields {
  id: string;
  shortName: string;
  accountIdNum?: string;
  typeId: string;
  typeName: string;
  tags: string[];
  institutionName?: string;
  description: string;
  status: PymtAccStatus;
  auditDetails: AuditFields;
  dropdownTooltip: string;
}
