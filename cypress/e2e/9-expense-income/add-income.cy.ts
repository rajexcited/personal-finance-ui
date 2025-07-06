import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { ExpenseBelongsTo } from "../../support/api-resource-types";
import { getExpenseIncome } from "../../support/fixture-utils/read-expense-income";
import { NavBarSelectors } from "../../support/resource-types";
import {
  selectExpenseDate,
  selectUploadReceipts,
  validateExpenseDateInForm,
  validateUploadReceiptSection
} from "../9-expense/utils/expense-form-utils";
import { getBelongsToLabel, validateExpenseCardOnSmall, validateExpenseTableRowOnLarge } from "../9-expense/utils/view-expense-utils";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType } from "../9-settings/utils/config-type-utils";

function runAddIncomeTest(incomeRef: string) {
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
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
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
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="add-income-error-message"]').should("not.exist");
  cy.get('[data-test="add-income-not-allowed"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
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
    { tags: ["expense", "income", "regression", "positive", "add", "add-income-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddIncomeTest("active-salary");
        validateExpenseCardOnSmall(ExpenseBelongsTo.Income, "active-salary");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddIncomeTest("active-salary");
        validateExpenseTableRowOnLarge(ExpenseBelongsTo.Income, "active-salary");
      });
    }
  );
});
