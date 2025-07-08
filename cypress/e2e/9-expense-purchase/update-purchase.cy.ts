import { getExpensePurchase, getExpensePurchaseList } from "../../support/fixture-utils/read-expense-purchase";
import { NavBarSelectors, UpdateRefOptions } from "../../support/resource-types";
import { validateAndToggleVerifyIndicator } from "./utils/purchase-form-utils";
import { ExpenseBelongsTo, ExpenseStatus } from "../../support/api-resource-types";
import { createOrUpdateExpensePurchase } from "../9-expense/utils/expense-api-utils";
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
import { createOrUpdatePurchaseType } from "../9-settings/utils/config-type-utils";
import { IndexedDbName } from "../../plugins/indexedDb/resource";

function runUpdatePurchaseTest(purchaseOptions: UpdateRefOptions, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");
  getExpensePurchase(purchaseOptions.updatingRef).then((purchaseData) => {
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
    createOrUpdatePurchaseType({ ref: purchaseData.purchaseTypeRef, status: "enable" });
  });
  createOrUpdateExpensePurchase(purchaseOptions.existingRef, ExpenseStatus.ENABLE);

  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  validateExpense(ExpenseBelongsTo.Purchase, purchaseOptions.existingRef).then(($actionContainer) => {
    navigateToEditExpense($actionContainer, ExpenseBelongsTo.Purchase);
  });
  cy.get('[data-test="update-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-purchase-error-message"]').should("not.exist");

  getExpensePurchaseList([purchaseOptions.existingRef, purchaseOptions.updatingRef]).then(([existingPurchaseData, updatingPuchaseData]) => {
    cy.get("#purchase-bill-name").should("be.visible").should("have.value", existingPurchaseData.billName).clear().type(updatingPuchaseData.billName);
    cy.get("#purchase-amount").should("be.visible").should("have.value", existingPurchaseData.amount).clear().type(updatingPuchaseData.amount);
    cy.selectDropdownItem({
      dropdownSelectorId: "purchase-pymt-acc",
      selectNewItemText: updatingPuchaseData.paymentAccountName,
      selectedItemText: existingPurchaseData.paymentAccountName,
      requiredError: true
    });
    cy.selectDropdownItem({
      dropdownSelectorId: "purchase-type",
      selectNewItemText: updatingPuchaseData.purchaseTypeName,
      selectedItemText: existingPurchaseData.purchaseTypeName,
      requiredError: true
    });
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: ${existingPurchaseData.description.length}/150`);
    cy.get("#purchase-desc")
      .should("be.visible")
      .should("have.value", existingPurchaseData.description)
      .clear()
      .type(updatingPuchaseData.description);
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: ${updatingPuchaseData.description.length}/150`);
    cy.selectTags({
      tagsSelectorId: "purchase-tags",
      addTagValues: updatingPuchaseData.tags,
      existingTagValues: existingPurchaseData.tags,
      removeTagValues: []
    });
    cy.selectSharePersonTags({ selectorId: "person-tags", addValues: [], existingValues: [], removeValues: [] });
    validateAndToggleVerifyIndicator(existingPurchaseData.verifiedTimestamp, false);

    validateExpenseDateInForm(existingPurchaseData.purchaseDate);
    selectExpenseDate({ newExpenseDate: updatingPuchaseData.purchaseDate, existingExpenseDate: existingPurchaseData.purchaseDate });
    validateExpenseDateInForm(updatingPuchaseData.purchaseDate);
    validateUploadReceiptSection(existingPurchaseData.receipts, getBelongsToLabel(ExpenseBelongsTo.Purchase));
    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-purchase"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-purchase"]')
    .filter(":visible")
    .should("have.length", 1)
    .should("be.visible")
    .should("have.text", "Update")
    .click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="update-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-purchase-error-message"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
  validateExpense(ExpenseBelongsTo.Purchase, purchaseOptions.updatingRef);
}

describe("Expense - Update Purchase Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can update an existing purchase successfully",
    { tags: ["expense", "purchase", "regression", "positive", "update", "edit-purchase-tc3"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runUpdatePurchaseTest({ existingRef: "energy-utility", updatingRef: "energy-utility-v2" }, validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runUpdatePurchaseTest({ existingRef: "energy-utility-v2", updatingRef: "energy-utility" }, validateExpenseTableRowOnLarge);
      });
    }
  );
});
