import { ExpenseBelongsTo } from "../api-resource-types";
import { getFixtureFile } from "./fixture-util";
import { ReceiptDetailType } from "./read-expense-purchase";

export interface ExpenseRefundDetailType {
  ref: string;
  id: string;
  billName: string;
  tags: string[];
  receipts: Array<ReceiptDetailType>;
  amount: string;
  description: string;
  reasonName: string;
  reasonRef: string;
  paymentAccountName: string;
  paymentAccountRef: string;
  purchaseId?: string;
  purchaseRef?: string;
  refundDate: string;
  belongsTo: ExpenseBelongsTo.Refund;
}

const aliasName = "expenseRefundMap";
beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

export const updateExpenseRefund = (key: string, expense: ExpenseRefundDetailType) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expenseRefundMap: Record<string, ExpenseRefundDetailType> = data;
    expenseRefundMap[key] = expense;
    cy.wrap(expenseRefundMap).as(aliasName);
  });
};

const populateExpenseRefundMap = () => {
  getFixtureFile("expenses/refund").then((data) => {
    const expenseRefundMap: Record<string, ExpenseRefundDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as ExpenseRefundDetailType) : null;
      expenseRefundMap[key] = {
        ref: key,
        id: val?.id || "",
        billName: val?.billName || "",
        tags: val?.tags || [],
        receipts: val?.receipts || [],
        amount: val?.amount || "",
        description: val?.description || "",
        reasonName: val?.reasonName || "",
        reasonRef: val?.reasonRef || "",
        paymentAccountName: val?.paymentAccountName || "",
        paymentAccountRef: val?.paymentAccountRef || "",
        refundDate: val?.refundDate || "",
        belongsTo: ExpenseBelongsTo.Refund,
        purchaseRef: val?.purchaseRef
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} expense refund are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} expense refund are populated. ref keys: ${refKeys}`);
    cy.wrap(expenseRefundMap).as(aliasName);
  });
};

const findExpenseRefund = (expenseRefundMap: Record<string, ExpenseRefundDetailType>, expenseRefundRef: string) => {
  if (expenseRefundMap[expenseRefundRef]) {
    return expenseRefundMap[expenseRefundRef];
  }
  throw new Error(`No matching expense refund found for ref [${expenseRefundRef}]`);
};

export const getExpenseRefund = (expenseRefundRef: string) => {
  return getExpenseRefundList([expenseRefundRef]).then((list) => list[0]);
};

/**
 * reads expense refund details from fixture test data setup file
 *
 * @param expenseRefundRefs
 * @returns
 */
export const getExpenseRefundList = (expenseRefundRefs: string[]) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expenseRefundMap: Record<string, ExpenseRefundDetailType> = data;
    if (Object.keys(expenseRefundMap).length === 0) {
      populateExpenseRefundMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const expenseRefundMap: Record<string, ExpenseRefundDetailType> = data;
    const results = expenseRefundRefs.map((ref) => findExpenseRefund(expenseRefundMap, ref));
    return results;
  });
};
