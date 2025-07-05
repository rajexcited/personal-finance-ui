import { ExpenseBelongsTo } from "../api-resource-types";
import { getFixtureFile } from "./fixture-util";
import { ReceiptDetailType } from "./read-expense-purchase";

export interface ExpenseIncomeDetailType {
  ref: string;
  id: string;
  billName: string;
  tags: string[];
  receipts: Array<ReceiptDetailType>;
  amount: string;
  description: string;
  incomeTypeName: string;
  incomeTypeRef: string;
  paymentAccountName: string;
  paymentAccountRef: string;
  incomeDate: string;
  belongsTo: ExpenseBelongsTo.Income;
}

const aliasName = "expenseIncomeMap";
beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

export const updateExpenseIncome = (key: string, expense: ExpenseIncomeDetailType) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expenseIncomeMap: Record<string, ExpenseIncomeDetailType> = data;
    expenseIncomeMap[key] = expense;
    cy.wrap(expenseIncomeMap).as(aliasName);
  });
};

const populateExpenseIncomeMap = () => {
  getFixtureFile("expenses/income").then((data) => {
    const expenseIncomeMap: Record<string, ExpenseIncomeDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as ExpenseIncomeDetailType) : null;
      expenseIncomeMap[key] = {
        ref: key,
        id: val?.id || "",
        billName: val?.billName || "",
        tags: val?.tags || [],
        receipts: val?.receipts || [],
        amount: val?.amount || "",
        description: val?.description || "",
        incomeTypeName: val?.incomeTypeName || "",
        incomeTypeRef: val?.incomeTypeRef || "",
        paymentAccountName: val?.paymentAccountName || "",
        paymentAccountRef: val?.paymentAccountRef || "",
        incomeDate: val?.incomeDate || "",
        belongsTo: ExpenseBelongsTo.Income
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} expense income are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} expense income are populated. ref keys: ${refKeys}`);
    cy.wrap(expenseIncomeMap).as(aliasName);
  });
};

const findExpenseIncome = (expenseIncomeMap: Record<string, ExpenseIncomeDetailType>, expenseIncomeRef: string) => {
  if (expenseIncomeMap[expenseIncomeRef]) {
    return expenseIncomeMap[expenseIncomeRef];
  }
  throw new Error(`No matching expense income found for ref [${expenseIncomeRef}]`);
};

export const getExpenseIncome = (expenseIncomeRef: string) => {
  return getExpenseIncomeList([expenseIncomeRef]).then((list) => list[0]);
};

/**
 * reads expense income details from fixture test data setup file
 *
 * @param expenseIncomeRefs
 * @returns
 */
export const getExpenseIncomeList = (expenseIncomeRefs: string[]) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const expenseIncomeMap: Record<string, ExpenseIncomeDetailType> = data;
    if (Object.keys(expenseIncomeMap).length === 0) {
      populateExpenseIncomeMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const expenseIncomeMap: Record<string, ExpenseIncomeDetailType> = data;
    const results = expenseIncomeRefs.map((ref) => findExpenseIncome(expenseIncomeMap, ref));
    return results;
  });
};
