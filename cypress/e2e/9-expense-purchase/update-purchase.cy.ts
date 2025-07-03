import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { dateFormatLabel, formatTimestamp, parseTimestamp, purchaseDateFormatFixture } from "../../support/date-utils";
import { getExpensePurchase, getExpensePurchaseList } from "../../support/fixture-utils/read-expense-purchase";
import { NavBarSelectors } from "../../support/resource-types";
import {
  selectPurchaseDate,
  validateAndToggleVerifyIndicator,
  validatePurchaseDateInForm,
  validateUploadReceiptSection
} from "./utils/purchase-form-utils";
import { ExpenseStatus } from "../../support/api-resource-types";
import { belongsToLabel, validatePurchaseCardOnSmall, validatePurchaseTableRowOnLarge } from "./utils/view-expense-utils";
import { createOrUpdateExpensePurchase } from "./utils/expense-api-utils";

function navigateToEditPurchase($actionContainer: JQuery<HTMLElement>, purchaseRef: string) {
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, purchaseDateFormatFixture), dateFormatLabel);
    const verifiedTimestamp = purchaseData.verifiedTimestamp ? formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateFormatLabel) : "-";

    cy.wrap($actionContainer).find('[data-test="expense-update-action"]').should("be.visible").click();
  });
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/purchase/").should("include", "/update");
}

function runUpdatePurchaseTest(
  purchaseRefOptions: { existingPurchaseRef: string; updatingPurchaseRef: string },
  validateViewCallback: (purchaseRef: string) => Cypress.Chainable<JQuery<HTMLElement>>
) {
  cy.loginThroughUI("user1-success");
  createOrUpdateExpensePurchase(purchaseRefOptions.existingPurchaseRef, ExpenseStatus.ENABLE);

  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  validateViewCallback(purchaseRefOptions.existingPurchaseRef).then(($actionContainer) => {
    navigateToEditPurchase($actionContainer, purchaseRefOptions.existingPurchaseRef);
  });
  cy.get('[data-test="update-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-purchase-error-message"]').should("not.exist");

  getExpensePurchaseList([purchaseRefOptions.existingPurchaseRef, purchaseRefOptions.updatingPurchaseRef]).then(
    ([existingPurchaseData, updatingPuchaseData]) => {
      cy.get("#purchase-bill-name")
        .should("be.visible")
        .should("have.value", existingPurchaseData.billName)
        .clear()
        .type(updatingPuchaseData.billName);
      cy.get("#purchase-amount").should("be.visible").should("have.value", existingPurchaseData.amount).clear().type(updatingPuchaseData.amount);
      cy.selectDropdownItem({
        dropdownSelectorId: "purchase-pymt-acc",
        selectNewItemText: updatingPuchaseData.paymentAccountName,
        selectedItemText: existingPurchaseData.paymentAccountName
      });
      cy.selectDropdownItem({
        dropdownSelectorId: "purchase-type",
        selectNewItemText: updatingPuchaseData.purchaseTypeName,
        selectedItemText: existingPurchaseData.purchaseTypeName
      });
      cy.get('[data-test="purchase-desc-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${existingPurchaseData.description.length}/150`);
      cy.get("#purchase-desc")
        .should("be.visible")
        .should("have.value", existingPurchaseData.description)
        .clear()
        .type(updatingPuchaseData.description);
      cy.get('[data-test="purchase-desc-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${updatingPuchaseData.description.length}/150`);
      cy.selectTags({
        tagsSelectorId: "purchase-tags",
        addTagValues: updatingPuchaseData.tags,
        existingTagValues: existingPurchaseData.tags,
        removeTagValues: existingPurchaseData.tags.filter((tv) => !updatingPuchaseData.tags.includes(tv))
      });
      validateAndToggleVerifyIndicator(existingPurchaseData.verifiedTimestamp, false);

      validatePurchaseDateInForm(existingPurchaseData.purchaseDate);
      selectPurchaseDate({ newPurchaseDate: updatingPuchaseData.purchaseDate, existingPurchaseDate: existingPurchaseData.purchaseDate });
      validatePurchaseDateInForm(updatingPuchaseData.purchaseDate);
      validateUploadReceiptSection(existingPurchaseData.receipts);
      // wait for debounce events to complete for inputs
      cy.wait(500);
    }
  );
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-purchase"]').should("be.visible").should("have.text", "Cancel").should("have.length", 1);
  cy.get('button[data-test="submit-purchase"]')
    .filter(":visible")
    .should("be.visible")
    .should("have.text", "Update")
    .should("have.length", 1)
    .click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="update-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-test="update-purchase-error-message"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
  validateViewCallback(purchaseRefOptions.updatingPurchaseRef);
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
        runUpdatePurchaseTest({ existingPurchaseRef: "energy-utility", updatingPurchaseRef: "energy-utility-v2" }, validatePurchaseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        const validateCallback = (ref: string) => validatePurchaseTableRowOnLarge(ref, true);
        runUpdatePurchaseTest({ existingPurchaseRef: "energy-utility-v2", updatingPurchaseRef: "energy-utility" }, validateCallback);
      });
    }
  );
});
