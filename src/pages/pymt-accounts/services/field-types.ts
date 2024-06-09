import { AuditFields } from "../../../services";

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
}

/**
 * General category. this is usually broad types. any specifics user can add as tags
 */
// export enum AccountType {
//   checking,
//   savings,
//   creditCard,
//   investment,
//   ira,
//   loan,
// }
