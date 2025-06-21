import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { getPaymentAccount } from "../../support/read-payment-account";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "./utils/payment-account-api-utils";
import { getPaymentAccountCard, validateCard } from "./utils/view-payment-account-utils";

export const verifyViewPaymentAccountCard = (existingPaymentAccountRef: string) => {
  cy.url().should("include", "/payment-accounts");
  cy.get('[data-test="add-payment-account-button"]').should("be.visible");

  cy.get('section[data-test="payment-account-section"]').should("be.visible");
  cy.get('[data-test="payment-account-list-error-message"]').should("not.exist");
  cy.get('[data-test="no-payment-account-message"]').should("not.exist");
  cy.get('[data-test="payment-account-card"]')
    .should("have.length.at.least", 2)
    .then(($els) => {
      validateCard(existingPaymentAccountRef, $els, true);
    });
};

function runUpdatePaymentAccountTest(options: { existingPaymentAccountRef: string; updatingPaymentAccountRef: string }) {
  cy.loginThroughUI("user1-success");
  createOrUpdatePaymentAccount([{ ref: options.existingPaymentAccountRef, status: "enable" }]);
  cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountNavlink);
  verifyViewPaymentAccountCard(options.existingPaymentAccountRef);

  getPaymentAccount(options.existingPaymentAccountRef).then((existingPaymentAccountData) => {
    cy.get('[data-test="payment-account-card"]').then(($cardElementList) => {
      getPaymentAccountCard($cardElementList, existingPaymentAccountData.shortName).then((filteredElement) => {
        cy.wrap(filteredElement).within(() => {
          cy.get('[data-test="card-header-action-update"]').should("be.visible").click();
        });
        cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");

        cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
        cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
        cy.url().should("include", "/update");

        getPaymentAccount(options.updatingPaymentAccountRef).then((updatingPaymentAccountData) => {
          cy.get("#account-short-name")
            .should("be.visible")
            .should("have.value", existingPaymentAccountData.shortName)
            .clear()
            .type(updatingPaymentAccountData.shortName);
          cy.get("#account-instritution-name")
            .should("be.visible")
            .should("have.value", existingPaymentAccountData.institutionName)
            .clear()
            .type(updatingPaymentAccountData.institutionName);
          cy.get("#account-number")
            .should("be.visible")
            .should("have.value", existingPaymentAccountData.accountName)
            .clear()
            .type(updatingPaymentAccountData.accountName);
          cy.selectDropdownItem({
            dropdownSelectorId: "account-type",
            selectedItemText: existingPaymentAccountData.accountTypeName,
            selectNewItemText: updatingPaymentAccountData.accountTypeName
          });
          cy.selectTags({
            tagsSelectorId: "pymt-acc-tags",
            existingTagValues: existingPaymentAccountData.tags,
            addTagValues: updatingPaymentAccountData.tags,
            removeTagValues: existingPaymentAccountData.tags.filter((tv) => !updatingPaymentAccountData.tags.includes(tv))
          });
          cy.get('[data-test="account-desc-counter"]')
            .should("be.visible")
            .should("have.text", `counter: ${existingPaymentAccountData.description.length}/150`);
          cy.get("#account-desc")
            .should("be.visible")
            .should("have.value", existingPaymentAccountData.description)
            .clear()
            .type(updatingPaymentAccountData.description);
          cy.get('[data-test="account-desc-counter"]')
            .should("be.visible")
            .should("have.text", `counter: ${updatingPaymentAccountData.description.length}/150`);
          // wait for debounce events to complete for inputs
          cy.wait(500);
        });
      });
    });
  });
  cy.verifyCurrencySection();
  cy.get('button[data-test="cancel-payment-account"]').should("be.visible");
  cy.get('button[data-test="submit-payment-account"]').filter(":visible").should("be.visible").should("have.text", "Update").click();

  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="update-payment-account-error-message"]').should("not.exist");
  cy.get('section[data-test="payment-account-section"]').should("be.visible");

  verifyViewPaymentAccountCard(options.updatingPaymentAccountRef);
}

describe("Payment Account - Update Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can update an existing payment account successfully",
    { tags: ["payment-account", "regression", "positive", "update", "update-payment-account-tc3"] },
    () => {
      context("update all fields", () => {
        it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
          cy.setViewport("pixel9-pro");
          runUpdatePaymentAccountTest({ existingPaymentAccountRef: "travel-rewards-cc", updatingPaymentAccountRef: "travel-saving" });
        });

        it("via large desktop view", { tags: ["desktop"] }, () => {
          cy.setViewport("desktop");
          runUpdatePaymentAccountTest({ existingPaymentAccountRef: "travel-saving", updatingPaymentAccountRef: "travel-rewards-cc" });
        });
      });
    }
  );
});
