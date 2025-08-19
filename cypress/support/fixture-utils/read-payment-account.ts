import { getFixtureFile } from "./fixture-util";

export interface PaymentAccountDetailType {
  ref: string;
  id: string;
  shortName: string;
  accountName: string;
  institutionName: string;
  accountTypeName: string;
  accountTypeId: string;
  accountTypeRef: string;
  tags: string[];
  description: string;
}

const aliasName = "paymentAccountMap";
beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

export const updatePaymentAccount = (paymentAccount: PaymentAccountDetailType) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const paymentAccountMap: Record<string, PaymentAccountDetailType> = data;
    paymentAccountMap[paymentAccount.ref] = paymentAccount;
    cy.wrap(paymentAccountMap).as(aliasName);
  });
};

const populatePaymentAccountMap = () => {
  return getFixtureFile("payment-accounts").then((data) => {
    const paymentAccountMap: Record<string, PaymentAccountDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as PaymentAccountDetailType) : null;
      paymentAccountMap[key] = {
        ref: key,
        id: val?.id || "",
        shortName: val?.shortName || "",
        accountName: val?.accountName || "",
        institutionName: val?.institutionName || "",
        accountTypeName: val?.accountTypeName || "",
        accountTypeId: val?.accountTypeId || "",
        accountTypeRef: val?.accountTypeRef || "",
        tags: val?.tags || [],
        description: val?.description || ""
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} payment accounts are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} payment accounts are populated. ref keys: ${refKeys}`);
    cy.wrap(paymentAccountMap).as(aliasName);
  });
};

const findPaymentAccount = (paymentAccountMap: Record<string, PaymentAccountDetailType>, paymentAccountRef: string) => {
  if (paymentAccountMap[paymentAccountRef]) {
    return paymentAccountMap[paymentAccountRef];
  }
  throw new Error(`No matching payment account found for ref [${paymentAccountRef}]`);
};

export const getPaymentAccount = (paymentAccountRef: string) => {
  return getPaymentAccountList([paymentAccountRef]).then((list) => list[0]);
};

/**
 * reads payment account details from fixture test data setup file
 *
 * @param paymentAccountRefs
 * @returns
 */
export const getPaymentAccountList = (paymentAccountRefs: string[]) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const paymentAccountMap: Record<string, PaymentAccountDetailType> = data;
    if (Object.keys(paymentAccountMap).length === 0) {
      populatePaymentAccountMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const paymentAccountMap: Record<string, PaymentAccountDetailType> = data;
    const nonNullRefs = paymentAccountRefs.filter((r) => r !== null && r !== undefined).filter((r) => !!r);
    const results = nonNullRefs.map((ref) => findPaymentAccount(paymentAccountMap, ref));
    return results;
  });
};
