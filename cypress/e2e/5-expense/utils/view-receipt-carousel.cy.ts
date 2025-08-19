import { ExpenseBelongsTo, ExpenseStatus } from "../../../support/api-resource-types";
import { expenseDateFormatFixture, formatTimestamp, parseTimestamp, subtractDates } from "../../../support/date-utils";
import { getExpenseIncome, updateExpenseIncome } from "../../../support/fixture-utils/read-expense-income";
import { getExpensePurchase, updateExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";
import { getExpenseRefund, updateExpenseRefund } from "../../../support/fixture-utils/read-expense-refund";
import { NavBarSelectors } from "../../../support/resource-types";
import { createOrUpdateExpenseIncome, createOrUpdateExpensePurchase, createOrUpdateExpenseRefund } from "./expense-api-utils";
import { ValidateExpenseCallbackFn, validateExpenseCardOnSmall, validateExpenseTableRowOnLarge } from "./view-expense-utils";

const changeMonths = (expenseDate: string, subtractMonthToCurrent: number) => {
  const today = new Date();
  const dateInstance = parseTimestamp(expenseDate, expenseDateFormatFixture);
  dateInstance.setMonth(today.getMonth() - subtractMonthToCurrent);

  return formatTimestamp(dateInstance, expenseDateFormatFixture);
};

function runNoReceiptsTest(options: { purchaseRef: string; refundRef: string; incomeRef: string }, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");

  getExpensePurchase(options.purchaseRef).then((purchaseData) => {
    // TBD: backdate to 1 year to test loadmore functionality as well
    updateExpensePurchase({ ...purchaseData, purchaseDate: changeMonths(purchaseData.purchaseDate, 1) });
  });
  createOrUpdateExpensePurchase(options.purchaseRef, ExpenseStatus.ENABLE);
  getExpenseIncome(options.incomeRef).then((incomeData) => {
    updateExpenseIncome({ ...incomeData, incomeDate: changeMonths(incomeData.incomeDate, 2) });
  });
  createOrUpdateExpenseIncome(options.incomeRef, ExpenseStatus.ENABLE);
  getExpenseRefund(options.refundRef).then((refundData) => {
    updateExpenseRefund({ ...refundData, refundDate: changeMonths(refundData.refundDate, 3) });
  });
  createOrUpdateExpenseRefund(options.refundRef, ExpenseStatus.ENABLE);

  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");

  validateExpense(ExpenseBelongsTo.Purchase, options.purchaseRef);
  validateExpense(ExpenseBelongsTo.Income, options.incomeRef);
  validateExpense(ExpenseBelongsTo.Refund, options.refundRef);
}

describe("Expense List - Receipt Carousel Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user doesnot see view receipt action because expenses doesn't have receipts",
    { tags: ["expense", "regression", "positive", "view", "view-receipts-expenses-tc2", "view-expense-list-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runNoReceiptsTest(
          { purchaseRef: "birthday-gift", refundRef: "birthday-gift-adjustment", incomeRef: "freelance-feb" },
          validateExpenseCardOnSmall
        );
      });
      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runNoReceiptsTest(
          { purchaseRef: "birthday-gift", refundRef: "birthday-gift-adjustment", incomeRef: "freelance-feb" },
          validateExpenseTableRowOnLarge
        );
      });
    }
  );
});
