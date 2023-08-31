export interface AccountFields {
  accountId: string;
  shortName: string;
  accountName: string;
  accountNumber: string;
  type?: AccountType;
  tags: string;
  institutionName: string;
  description: string;
}

/**
 * General category. this is usually broad types. any specifics user can add as tags
 */
export enum AccountType {
  checking,
  savings,
  creditCard,
  investment,
  ira,
  loan,
}
