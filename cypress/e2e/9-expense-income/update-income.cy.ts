import { getExpenseIncome, getExpenseIncomeList } from "../../support/fixture-utils/read-expense-income";
import { NavBarSelectors, UpdateRefOptions } from "../../support/resource-types";
import { ExpenseBelongsTo, ExpenseStatus } from "../../support/api-resource-types";
import { createOrUpdateExpenseIncome } from "../9-expense/utils/expense-api-utils";
import {
  navigateToEditExpense,
  selectExpenseDate,
  validateExpenseDateInForm,
  validateUploadReceiptSection
} from "../9-expense/utils/expense-form-utils";
import {
  getBelongsToLabel,
  ValidateExpenseCallbackFn,
  validateExpenseCardOnSmall,
  validateExpenseTableRowOnLarge
} from "../9-expense/utils/view-expense-utils";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType } from "../9-settings/utils/config-type-utils";
import { IndexedDbName } from "../../plugins/indexedDb/resource";

function runUpdateIncomeTest(incomeOptions: UpdateRefOptions, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");
  getExpenseIncome(incomeOptions.updatingRef).then((incomeData) => {
    createOrUpdatePaymentAccount([{ ref: incomeData.paymentAccountRef, status: "enable" }]);
    createOrUpdateIncomeType({ ref: incomeData.incomeTypeRef, status: "enable" });
  });
  createOrUpdateExpenseIncome(incomeOptions.existingRef, ExpenseStatus.ENABLE);

  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  validateExpense(ExpenseBelongsTo.Income, incomeOptions.existingRef).then(($actionContainer) => {
    navigateToEditExpense($actionContainer, ExpenseBelongsTo.Income);
  });
  cy.get('[data-test="update-income-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-income-error-message"]').should("not.exist");

  getExpenseIncomeList([incomeOptions.existingRef, incomeOptions.updatingRef]).then(([existingIncomeData, updatingPuchaseData]) => {
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
      removeTagValues: []
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
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();

  cy.get('[data-test="update-income-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-income-error-message"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
  validateExpense(ExpenseBelongsTo.Income, incomeOptions.updatingRef);
}

describe("Expense - Update Income Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can update an existing income successfully",
    {
      tags: [
        "expense",
        "income",
        "regression",
        "positive",
        "update",
        "edit-income-tc3",
        "view",
        "view-expense-list-tc1",
        "view-receipts-expenses-tc2"
      ]
    },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runUpdateIncomeTest({ existingRef: "passive-divident", updatingRef: "passive-divident-v2" }, validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runUpdateIncomeTest({ existingRef: "passive-divident-v2", updatingRef: "passive-divident" }, validateExpenseTableRowOnLarge);
      });
    }
  );
});
