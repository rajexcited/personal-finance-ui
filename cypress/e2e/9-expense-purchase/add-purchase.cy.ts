import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { formatTimestamp } from "../../support/date-utils";
import { getExpensePurchase, updateExpense } from "../../support/fixture-utils/read-expense-purchase";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { validatePurchaseCardOnSmall, validatePurchaseTableRowOnLarge } from "./utils/view-expense-utils";
import {
  selectPurchaseDate,
  selectUploadReceipts,
  validateAndToggleVerifyIndicator,
  validatePurchaseDateInForm,
  validateUploadReceiptSection
} from "./utils/purchase-form-utils";
import { createOrUpdatePurchaseType } from "../9-settings/utils/config-type-utils";

function runAddPurchaseTest(purchaseRef: string) {
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
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/purchase/add");
  cy.get('[data-test="add-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="add-purchase-error-message"]').should("not.exist");

  getExpensePurchase(purchaseRef).then((purchaseData) => {
    cy.get("#purchase-bill-name").should("be.visible").should("have.value", "").type(purchaseData.billName);
    cy.get("#purchase-amount").should("be.visible").should("have.value", "").type(purchaseData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-pymt-acc", selectNewItemText: purchaseData.paymentAccountName });
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-type", selectNewItemText: purchaseData.purchaseTypeName });
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#purchase-desc").should("be.visible").should("have.value", "").type(purchaseData.description);
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: ${purchaseData.description.length}/150`);
    cy.selectTags({ tagsSelectorId: "purchase-tags", addTagValues: purchaseData.tags, existingTagValues: [], removeTagValues: [] });
    validateAndToggleVerifyIndicator("", true);
    updateExpense(purchaseRef, { ...purchaseData, verifiedTimestamp: formatTimestamp(new Date()) });

    console.log("updated data", purchaseData);
    selectPurchaseDate({ newPurchaseDate: purchaseData.purchaseDate, existingPurchaseDate: new Date() });
    validatePurchaseDateInForm(purchaseData.purchaseDate);

    validateUploadReceiptSection([]);
    selectUploadReceipts(purchaseData.receipts);

    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-purchase"]').should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-purchase"]').filter(":visible").should("be.visible").should("have.text", "Add").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="add-purchase-error-message"]').should("not.exist");
  cy.get('[data-test="add-purchase-not-allowed"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
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
    { tags: ["expense", "purchase", "regression", "positive", "add", "add-purchase-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddPurchaseTest("local-grocery1");
        validatePurchaseCardOnSmall("local-grocery1");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddPurchaseTest("local-grocery2");
        validatePurchaseTableRowOnLarge("local-grocery2", true);
      });
    }
  );
});
