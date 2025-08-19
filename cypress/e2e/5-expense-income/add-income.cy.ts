import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { ExpenseBelongsTo } from "../../support/api-resource-types";
import { getExpenseIncome } from "../../support/fixture-utils/read-expense-income";
import { NavBarSelectors } from "../../support/resource-types";
import {
  selectExpenseDate,
  selectUploadReceipts,
  validateExpenseDateInForm,
  validateUploadReceiptSection
} from "../5-expense/utils/expense-form-utils";
import {
  getBelongsToLabel,
  ValidateExpenseCallbackFn,
  validateExpenseCardOnSmall,
  validateExpenseTableRowOnLarge
} from "../5-expense/utils/view-expense-utils";
import { createOrUpdatePaymentAccount } from "../5-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType } from "../5-settings/utils/config-type-utils";

function runAddIncomeTest(incomeRef: string, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");

  getExpenseIncome(incomeRef).then((incomeData) => {
    createOrUpdatePaymentAccount([{ ref: incomeData.paymentAccountRef, status: "enable" }]);
    createOrUpdateIncomeType({ ref: incomeData.incomeTypeRef, status: "enable" });
  });
  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  cy.get('[data-test="add-purchase-button"]').should("be.visible");
  cy.get('[data-test="add-refund-button"]').should("be.visible");
  cy.get('[data-test="add-income-button"]').should("be.visible").click();
  cy.waitForPageLoad();
  cy.url().should("include", "/income/add");
  cy.get('[data-test="add-income-not-allowed"]').should("not.exist");
  cy.get('[data-test="add-income-error-message"]').should("not.exist");

  getExpenseIncome(incomeRef).then((incomeData) => {
    cy.get("#income-bill-name").should("be.visible").should("have.value", "").type(incomeData.billName);
    cy.get("#income-amount").should("be.visible").should("have.value", "").type(incomeData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "income-pymt-acc", selectNewItemText: incomeData.paymentAccountName, requiredError: true });
    cy.selectDropdownItem({ dropdownSelectorId: "income-type", selectNewItemText: incomeData.incomeTypeName, requiredError: true });
    cy.get('[data-test="income-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#income-desc").should("be.visible").should("have.value", "").type(incomeData.description);
    cy.get('[data-test="income-desc-counter"]').should("be.visible").should("have.text", `counter: ${incomeData.description.length}/150`);
    cy.selectTags({ tagsSelectorId: "income-tags", addTagValues: incomeData.tags, existingTagValues: [], removeTagValues: [] });

    selectExpenseDate({ newExpenseDate: incomeData.incomeDate, existingExpenseDate: new Date() });
    validateExpenseDateInForm(incomeData.incomeDate);

    validateUploadReceiptSection([], getBelongsToLabel(ExpenseBelongsTo.Income));
    selectUploadReceipts(incomeData.receipts, ExpenseBelongsTo.Income, getBelongsToLabel(ExpenseBelongsTo.Income));

    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-income"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-income"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Add").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();

  cy.get('[data-test="add-income-error-message"]').should("not.exist");
  cy.get('[data-test="add-income-not-allowed"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");

  validateExpense(ExpenseBelongsTo.Income, incomeRef);
}

describe("Expense - Add Income Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can add a new income successfully",
    { tags: ["expense", "income", "regression", "positive", "add", "add-income-tc1", "view", "view-expense-list-tc1", "view-receipts-expenses-tc2"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddIncomeTest("active-salary", validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddIncomeTest("active-salary", validateExpenseTableRowOnLarge);
      });
    }
  );
});
