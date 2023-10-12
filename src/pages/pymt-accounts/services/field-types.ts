import { AuditFields } from "../../../services";

export interface PymtAccountFields extends AuditFields {
  accountId: string;
  shortName: string;
  accountName: string;
  accountNumber: string;
  typeId?: string;
  typeName?: string;
  tags: string;
  institutionName: string;
  description: string;
  icon?: string;
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
