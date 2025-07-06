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
import { ExpenseBelongsTo, ExpenseStatus } from "../../support/api-resource-types";
import { getBelongsToLabel, validateExpenseCardOnSmall, validateExpenseTableRowOnLarge } from "../9-expense/utils/view-expense-utils";
import { createOrUpdateExpensePurchase } from "../9-expense/utils/expense-api-utils";
import { getExpensePurchase } from "../../support/fixture-utils/read-expense-purchase";
import { expenseDateFormatFixture, formatTimestamp, parseTimestamp, shortDateFormat } from "../../support/date-utils";

type ValidateExpenseCallbackFn = (belongsTo: ExpenseBelongsTo, ref: string) => Cypress.Chainable<JQuery<HTMLElement>>;

function runAddRefundWithoutPurchaseTest(refundRef: string, validateExpense: ValidateExpenseCallbackFn) {
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
    cy.validateDropdownSelectedItem({ dropdownSelectorId: "purchase-dd", requiredError: false });
    cy.get('section[data-test="view-dialog"][data-dialog-id="purchase-quickview"]')
      .should("exist")
      .find('[data-test="open-dialog-action"]')
      .should("not.be.visible");
    cy.get("#refund-bill-name-empty").should("be.visible").should("have.value", "").type(refundData.billName).should("not.exist");
    cy.get("#refund-bill-name").should("be.visible").should("have.value", refundData.billName);
    cy.get("#refund-amount-empty").should("be.visible").should("have.value", "").type(refundData.amount).should("not.exist");
    cy.get("#refund-amount").should("be.visible").should("have.value", refundData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "refund-pymt-acc", selectNewItemText: refundData.paymentAccountName, requiredError: true });
    cy.selectDropdownItem({ dropdownSelectorId: "refund-reason", selectNewItemText: refundData.reasonName, requiredError: true });
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

  validateExpense(ExpenseBelongsTo.Refund, refundRef);
}

function runAddRefundWithPurchaseTest(refundRef: string, validateExpense: ValidateExpenseCallbackFn) {
  cy.loginThroughUI("user1-success");

  getExpenseRefund(refundRef).then((refundData) => {
    createOrUpdatePaymentAccount([{ ref: refundData.paymentAccountRef, status: "enable" }]);
    createOrUpdateRefundReason({ ref: refundData.reasonRef, status: "enable" });
    createOrUpdateExpensePurchase(refundData.purchaseRef, ExpenseStatus.ENABLE);

    cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
    cy.url().should("include", "/expense-journal");
    cy.get('[data-test="add-income-button"]').should("be.visible");
    cy.get('[data-test="add-purchase-button"]').should("be.visible");
    cy.get('[data-test="add-refund-button"]').should("be.visible");

    validateExpense(ExpenseBelongsTo.Purchase, refundData.purchaseRef).then(($actionContainer) => {
      cy.wrap($actionContainer).find('[data-test="expense-add-refund-action"]').should("be.visible").click();
    });
  });

  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/refund/add");
  cy.get('[data-test="add-refund-not-allowed"]').should("not.exist");
  cy.get('[data-test="add-refund-error-message"]').should("not.exist");

  getExpenseRefund(refundRef).then((refundData) => {
    getExpensePurchase(refundData.purchaseRef).then((purchaseData) => {
      cy.get('section[data-test="view-dialog"][data-dialog-id="purchase-quickview"]')
        .should("be.visible")
        .within(() => {
          cy.get('[data-test="open-dialog-action"]').should("be.visible").click();

          const purchaseQuickviewBlocks = [
            { label: "BillName", outValue: purchaseData.billName },
            { label: "Amount", outValue: purchaseData.amount },
            { label: "Payment Account", outValue: purchaseData.paymentAccountName },
            { label: "Tag Persons", outValue: "-" }
          ];
          cy.get(".block").each(($cel, ind) => {
            cy.wrap($cel.find("label")).should("be.visible").should("contain.text", purchaseQuickviewBlocks[ind].label);
            cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", purchaseQuickviewBlocks[ind].outValue);
          });

          cy.get('[data-test="close-dialog-action"]').should("be.visible").click();
        });

      const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, expenseDateFormatFixture), shortDateFormat);
      const selectedPurchaseText = `Billname: ${purchaseData.billName}; Amount: ${purchaseData.amount}; Purchase Date: ${purchaseDate}`;
      cy.validateDropdownSelectedItem({ dropdownSelectorId: "purchase-dd", requiredError: false, selectedItemText: selectedPurchaseText });

      cy.get("#refund-bill-name-empty").should("not.exist");
      cy.get("#refund-bill-name").should("be.visible").should("have.value", `Refund for ${purchaseData.billName}`).clear().type(refundData.billName);

      cy.get("#refund-amount-empty").should("not.exist");
      cy.get("#refund-amount").should("be.visible").should("have.value", purchaseData.amount).clear().type(refundData.amount);

      cy.validateDropdownSelectedItem({
        dropdownSelectorId: "refund-pymt-acc",
        selectedItemText: purchaseData.paymentAccountName,
        requiredError: true
      });
      cy.selectDropdownItem({ dropdownSelectorId: "refund-reason", selectNewItemText: refundData.reasonName, requiredError: true });

      cy.get('[data-test="selected-purchase-billname-info"]').should("be.visible").should("contain.text", purchaseData.billName);
      cy.get('[data-test="selected-purchase-amount-info"]').should("be.visible").should("contain.text", purchaseData.amount);
      cy.get('[data-test="selected-purchase-payment-account-info"]').should("be.visible").should("contain.text", purchaseData.paymentAccountName);
      cy.get('[data-test="selected-purchase-share-person-info"]').should("be.visible");
      cy.get('[data-test="selected-purchase-tags-info"]')
        .should("be.visible")
        .should("contain.text", "tags will auto apply in dashboard total. No need to add same tags here");
    });

    cy.get('[data-test="refund-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#refund-desc").should("be.visible").should("have.value", "").type(refundData.description);
    cy.get('[data-test="refund-desc-counter"]').should("be.visible").should("have.text", `counter: ${refundData.description.length}/150`);

    cy.selectTags({ tagsSelectorId: "refund-tags", addTagValues: refundData.tags, existingTagValues: [], removeTagValues: [] });
    cy.selectSharePersonTags({ selectorId: "person-tags", addValues: [], existingValues: [], removeValues: [] });

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
    "A logged in and active user can add a new refund without selecting purchase successfully",
    { tags: ["expense", "refund", "regression", "positive", "add", "add-refund-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddRefundWithoutPurchaseTest("overcharge-reversal", validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddRefundWithoutPurchaseTest("overcharge-reversal", validateExpenseTableRowOnLarge);
      });
    }
  );

  context(
    "A logged in and active user can add refund with selecting purchase successfully",
    { tags: ["expense", "refund", "regression", "positive", "add", "add-refund-tc2"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddRefundWithPurchaseTest("giftcard-return", validateExpenseCardOnSmall);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddRefundWithPurchaseTest("giftcard-return", validateExpenseTableRowOnLarge);
      });
    }
  );
});
