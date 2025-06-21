import { getFixtureFile } from "./fixture-util";

export interface PaymentAccountDetailType {
  ref: string;
  id: string;
  shortName: string;
  accountName: string;
  institutionName: string;
  accountTypeName: string;
  accountTypeId: string;
  tags: string[];
  description: string;
}

const paymentAccountMap: Record<string, PaymentAccountDetailType> = {};
let paymentAccountMapSize = 0;

const populatePaymentAccountMap = (data: Object) => {
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
      tags: val?.tags || [],
      description: val?.description || ""
    };
  });
  const refKeys = Object.keys(data);
  cy.log(`total ${refKeys.length} payment accounts are populated. ref keys: ${refKeys}`);
};

const findPaymentAccount = (paymentAccountRef: string) => {
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
  const filterListPredicate = () => paymentAccountRefs.map(findPaymentAccount);

  if (paymentAccountMapSize === 0) {
    return getFixtureFile("payment-accounts").then((data) => {
      //   cy.log(`read test data file. data=${data}`);
      populatePaymentAccountMap(data);
      return cy.wrap(filterListPredicate());
    });
  }
  return cy.wrap(filterListPredicate());
};
