import { formatTimestamp } from "../../support/date-utils";
import { getExpensePurchase, updateExpensePurchase } from "../../support/fixture-utils/read-expense-purchase";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "../5-payment-accounts/utils/payment-account-api-utils";
import { validateAndToggleVerifyIndicator } from "./utils/purchase-form-utils";
import { createOrUpdatePurchaseType } from "../5-settings/utils/config-type-utils";
import {
  selectExpenseDate,
  selectUploadReceipts,
  validateExpenseDateInForm,
  validateUploadReceiptSection
} from "../5-expense/utils/expense-form-utils";
import { ExpenseBelongsTo } from "../../support/api-resource-types";
import {
  getBelongsToLabel,
  ValidateExpenseCallbackFn,
  validateExpenseCardOnSmall,
  validateExpenseTableRowOnLarge
} from "../5-expense/utils/view-expense-utils";
import { IndexedDbName } from "../../plugins/indexedDb/resource";

function runAddPurchaseTest(purchaseRef: string, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");

  getExpensePurchase(purchaseRef).then((purchaseData) => {
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
    createOrUpdatePurchaseType({ ref: purchaseData.purchaseTypeRef, status: "enable" });
  });
  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  cy.get('[data-test="add-income-button"]').should("be.visible");
  cy.get('[data-test="add-refund-button"]').should("be.visible");
  cy.get('[data-test="add-purchase-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();
  cy.url().should("include", "/purchase/add");
  cy.get('[data-test="add-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="add-purchase-error-message"]').should("not.exist");

  getExpensePurchase(purchaseRef).then((purchaseData) => {
    cy.get("#purchase-bill-name").should("be.visible").should("have.value", "").type(purchaseData.billName);
    cy.get("#purchase-amount").should("be.visible").should("have.value", "").type(purchaseData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-pymt-acc", selectNewItemText: purchaseData.paymentAccountName, requiredError: true });
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-type", selectNewItemText: purchaseData.purchaseTypeName, requiredError: true });
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#purchase-desc").should("be.visible").should("have.value", "").type(purchaseData.description);
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: ${purchaseData.description.length}/150`);
    cy.selectTags({ tagsSelectorId: "purchase-tags", addTagValues: purchaseData.tags, existingTagValues: [], removeTagValues: [] });
    cy.selectSharePersonTags({ selectorId: "person-tags", addValues: [], existingValues: [], removeValues: [] });
    validateAndToggleVerifyIndicator("", true);
    updateExpensePurchase({ ...purchaseData, verifiedTimestamp: formatTimestamp(new Date()) });

    selectExpenseDate({ newExpenseDate: purchaseData.purchaseDate, existingExpenseDate: new Date() });
    validateExpenseDateInForm(purchaseData.purchaseDate);

    validateUploadReceiptSection([], getBelongsToLabel(ExpenseBelongsTo.Purchase));
    selectUploadReceipts(purchaseData.receipts, ExpenseBelongsTo.Purchase, getBelongsToLabel(ExpenseBelongsTo.Purchase));

    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-purchase"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-purchase"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Add").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();

  cy.get('[data-test="add-purchase-error-message"]').should("not.exist");
  cy.get('[data-test="add-purchase-not-allowed"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");

  validateExpense(ExpenseBelongsTo.Purchase, purchaseRef);
}

describe("Expense - Add Purchase Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can add a new purchase successfully",
    {
      tags: [
        "expense",
        "purchase",
        "regression",
        "positive",
        "add",
        "add-purchase-tc1",
        "view",
        "view-expense-list-tc1",
        "view-receipts-expenses-tc2"
      ]
    },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddPurchaseTest("local-grocery1", validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddPurchaseTest("local-grocery2", validateExpenseTableRowOnLarge);
      });
    }
  );
});
