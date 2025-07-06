import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { getExpenseRefund } from "../../support/fixture-utils/read-expense-refund";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateRefundReason } from "../9-settings/utils/config-type-utils";
import {
  selectExpenseDate,
  selectUploadReceipts,
  validateExpenseDateInForm,
  validateUploadReceiptSection
} from "../9-expense/utils/expense-form-utils";
import { ExpenseBelongsTo } from "../../support/api-resource-types";
import { getBelongsToLabel, validateExpenseCardOnSmall, validateExpenseTableRowOnLarge } from "../9-expense/utils/view-expense-utils";

function runAddRefundWithoutPurchaseTest(refundRef: string) {
  cy.loginThroughUI("user1-success");

  getExpenseRefund(refundRef).then((refundData) => {
    createOrUpdatePaymentAccount([{ ref: refundData.paymentAccountRef, status: "enable" }]);
    createOrUpdateRefundReason({ ref: refundData.reasonRef, status: "enable" });
  });
  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  cy.get('[data-test="add-income-button"]').should("be.visible");
  cy.get('[data-test="add-purchase-button"]').should("be.visible");
  cy.get('[data-test="add-refund-button"]').should("be.visible").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/refund/add");
  cy.get('[data-test="add-refund-not-allowed"]').should("not.exist");
  cy.get('[data-test="add-refund-error-message"]').should("not.exist");

  getExpenseRefund(refundRef).then((refundData) => {
    cy.validateDropdownSelectedItem({ dropdownSelectorId: "purchase-dd" });
    cy.get('section[data-test="view-dialog"]').should("exist").find('[data-test="open-dialog"]').should("not.be.visible");
    cy.get("#refund-bill-name-empty").should("be.visible").should("have.value", "").type(refundData.billName).should("not.exist");
    cy.get("#refund-bill-name").should("be.visible").should("have.value", refundData.billName);
    cy.get("#refund-amount-empty").should("be.visible").should("have.value", "").type(refundData.amount).should("not.exist");
    cy.get("#refund-amount").should("be.visible").should("have.value", refundData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "refund-pymt-acc", selectNewItemText: refundData.paymentAccountName });
    cy.selectDropdownItem({ dropdownSelectorId: "refund-reason", selectNewItemText: refundData.reasonName });
    cy.get('[data-test="refund-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#refund-desc").should("be.visible").should("have.value", "").type(refundData.description);
    cy.get('[data-test="refund-desc-counter"]').should("be.visible").should("have.text", `counter: ${refundData.description.length}/150`);
    cy.selectTags({ tagsSelectorId: "refund-tags", addTagValues: refundData.tags, existingTagValues: [], removeTagValues: [] });
    cy.selectSharePersonTags({ selectorId: "person-tags", addValues: [], existingValues: [], removeValues: [] });

    cy.get('[data-test="selected-purchase-billname-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-amount-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-payment-account-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-share-person-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-tags-info"]').should("not.be.visible");

    console.log("refundData.refundDate=", refundData.refundDate);
    selectExpenseDate({ newExpenseDate: refundData.refundDate, existingExpenseDate: new Date() });
    validateExpenseDateInForm(refundData.refundDate);

    validateUploadReceiptSection([], getBelongsToLabel(ExpenseBelongsTo.Refund));
    selectUploadReceipts(refundData.receipts, ExpenseBelongsTo.Refund, getBelongsToLabel(ExpenseBelongsTo.Refund));

    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-refund"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-refund"]').filter(":visible").should("have.length", 1).should("be.visible").should("have.text", "Add").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="add-refund-error-message"]').should("not.exist");
  cy.get('[data-test="add-refund-not-allowed"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
}

describe("Expense - Add Refund Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can add a new refund without selecting refund successfully",
    { tags: ["expense", "refund", "regression", "positive", "add", "add-refund-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddRefundWithoutPurchaseTest("overcharge-reversal");
        validateExpenseCardOnSmall(ExpenseBelongsTo.Refund, "overcharge-reversal");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddRefundWithoutPurchaseTest("overcharge-reversal");
        validateExpenseTableRowOnLarge(ExpenseBelongsTo.Refund, "overcharge-reversal");
      });
    }
  );
});
