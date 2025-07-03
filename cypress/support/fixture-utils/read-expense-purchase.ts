import { ReceiptContentType } from "../api-resource-types";
import { getFixtureFile } from "./fixture-util";

export interface ReceiptDetailType {
  name: string;
  contentType: ReceiptContentType;
  id?: string;
}

export interface ExpensePurchaseDetailType {
  ref: string;
  id: string;
  billName: string;
  tags: string[];
  verifiedTimestamp: string;
  receipts: Array<ReceiptDetailType>;
  amount: string;
  description: string;
  purchaseTypeName: string;
  purchaseTypeRef: string;
  paymentAccountName: string;
  paymentAccountRef: string;
  purchaseDate: string;
  items: [];
}

const aliasName = "expensePurchaseMap";
beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

export const updateExpense = (key: string, expense: ExpensePurchaseDetailType) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expensePurchaseMap: Record<string, ExpensePurchaseDetailType> = data;
    expensePurchaseMap[key] = expense;
    cy.wrap(expensePurchaseMap).as(aliasName);
  });
};

const populateExpensePurchaseMap = () => {
  getFixtureFile("expenses/purchase").then((data) => {
    const expensePurchaseMap: Record<string, ExpensePurchaseDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as ExpensePurchaseDetailType) : null;
      expensePurchaseMap[key] = {
        ref: key,
        id: val?.id || "",
        billName: val?.billName || "",
        tags: val?.tags || [],
        verifiedTimestamp: val?.verifiedTimestamp || "",
        receipts: val?.receipts || [],
        amount: val?.amount || "",
        description: val?.description || "",
        purchaseTypeName: val?.purchaseTypeName || "",
        purchaseTypeRef: val?.purchaseTypeRef || "",
        paymentAccountName: val?.paymentAccountName || "",
        paymentAccountRef: val?.paymentAccountRef || "",
        purchaseDate: val?.purchaseDate || "",
        items: val?.items || []
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} expense purchase are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} expense purchase are populated. ref keys: ${refKeys}`);
    cy.wrap(expensePurchaseMap).as(aliasName);
  });
};

const findExpensePurchase = (expensePurchaseMap: Record<string, ExpensePurchaseDetailType>, expensePurchaseRef: string) => {
  if (expensePurchaseMap[expensePurchaseRef]) {
    return expensePurchaseMap[expensePurchaseRef];
  }
  throw new Error(`No matching expense purchase found for ref [${expensePurchaseRef}]`);
};

export const getExpensePurchase = (expensePurchaseRef: string) => {
  return getExpensePurchaseList([expensePurchaseRef]).then((list) => list[0]);
};

/**
 * reads expense purchase details from fixture test data setup file
 *
 * @param expensePurchaseRefs
 * @returns
 */
export const getExpensePurchaseList = (expensePurchaseRefs: string[]) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expensePurchaseMap: Record<string, ExpensePurchaseDetailType> = data;
    if (Object.keys(expensePurchaseMap).length === 0) {
      populateExpensePurchaseMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const expensePurchaseMap: Record<string, ExpensePurchaseDetailType> = data;
    const results = expensePurchaseRefs.map((ref) => findExpensePurchase(expensePurchaseMap, ref));
    return results;
  });
};
