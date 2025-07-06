import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { getExpenseIncome, getExpenseIncomeList } from "../../support/fixture-utils/read-expense-income";
import { NavBarSelectors } from "../../support/resource-types";
import { ExpenseBelongsTo, ExpenseStatus } from "../../support/api-resource-types";
import { createOrUpdateExpenseIncome } from "../9-expense/utils/expense-api-utils";
import { selectExpenseDate, validateExpenseDateInForm, validateUploadReceiptSection } from "../9-expense/utils/expense-form-utils";
import { getBelongsToLabel, validateExpenseCardOnSmall, validateExpenseTableRowOnLarge } from "../9-expense/utils/view-expense-utils";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType } from "../9-settings/utils/config-type-utils";

function navigateToEditIncome($actionContainer: JQuery<HTMLElement>) {
  cy.wrap($actionContainer).find('[data-test="expense-update-action"]').should("be.visible").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/income/").should("include", "/update");
}

function runUpdateIncomeTest(
  incomeRefOptions: { existingIncomeRef: string; updatingIncomeRef: string },
  validateViewCallback: (incomeRef: string) => Cypress.Chainable<JQuery<HTMLElement>>
) {
  cy.loginThroughUI("user1-success");
  getExpenseIncome(incomeRefOptions.updatingIncomeRef).then((incomeData) => {
    createOrUpdatePaymentAccount([{ ref: incomeData.paymentAccountRef, status: "enable" }]);
    createOrUpdateIncomeType({ ref: incomeData.incomeTypeRef, status: "enable" });
  });
  createOrUpdateExpenseIncome(incomeRefOptions.existingIncomeRef, ExpenseStatus.ENABLE);

  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  validateViewCallback(incomeRefOptions.existingIncomeRef).then(($actionContainer) => {
    navigateToEditIncome($actionContainer);
  });
  cy.get('[data-test="update-income-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-income-error-message"]').should("not.exist");

  getExpenseIncomeList([incomeRefOptions.existingIncomeRef, incomeRefOptions.updatingIncomeRef]).then(([existingIncomeData, updatingPuchaseData]) => {
    cy.get("#income-bill-name").should("be.visible").should("have.value", existingIncomeData.billName).clear().type(updatingPuchaseData.billName);
    cy.get("#income-amount").should("be.visible").should("have.value", existingIncomeData.amount).clear().type(updatingPuchaseData.amount);
    cy.selectDropdownItem({
      dropdownSelectorId: "income-pymt-acc",
      selectNewItemText: updatingPuchaseData.paymentAccountName,
      selectedItemText: existingIncomeData.paymentAccountName,
      requiredError: true
    });
    cy.selectDropdownItem({
      dropdownSelectorId: "income-type",
      selectNewItemText: updatingPuchaseData.incomeTypeName,
      selectedItemText: existingIncomeData.incomeTypeName,
      requiredError: true
    });
    cy.get('[data-test="income-desc-counter"]').should("be.visible").should("have.text", `counter: ${existingIncomeData.description.length}/150`);
    cy.get("#income-desc").should("be.visible").should("have.value", existingIncomeData.description).clear().type(updatingPuchaseData.description);
    cy.get('[data-test="income-desc-counter"]').should("be.visible").should("have.text", `counter: ${updatingPuchaseData.description.length}/150`);
    cy.selectTags({
      tagsSelectorId: "income-tags",
      addTagValues: updatingPuchaseData.tags,
      existingTagValues: existingIncomeData.tags,
      removeTagValues: existingIncomeData.tags.filter((tv) => !updatingPuchaseData.tags.includes(tv))
    });

    validateExpenseDateInForm(existingIncomeData.incomeDate);
    selectExpenseDate({ newExpenseDate: updatingPuchaseData.incomeDate, existingExpenseDate: existingIncomeData.incomeDate });
    validateExpenseDateInForm(updatingPuchaseData.incomeDate);
    validateUploadReceiptSection(existingIncomeData.receipts, getBelongsToLabel(ExpenseBelongsTo.Income));
    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-income"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-income"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Update").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="update-income-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-income-error-message"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
  validateViewCallback(incomeRefOptions.updatingIncomeRef);
}

describe("Expense - Update Income Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    // cy.logoutFromNav();
  });

  context(
    "A logged in and active user can update an existing income successfully",
    { tags: ["expense", "income", "regression", "positive", "update", "edit-income-tc3"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runUpdateIncomeTest(
          { existingIncomeRef: "passive-divident", updatingIncomeRef: "passive-divident-v2" },
          validateExpenseCardOnSmall.bind(null, ExpenseBelongsTo.Income)
        );
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runUpdateIncomeTest(
          { existingIncomeRef: "passive-divident-v2", updatingIncomeRef: "passive-divident" },
          validateExpenseTableRowOnLarge.bind(null, ExpenseBelongsTo.Income)
        );
      });
    }
  );
});
