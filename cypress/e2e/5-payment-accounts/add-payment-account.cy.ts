import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { getPaymentAccount } from "../../support/fixture-utils/read-payment-account";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccountType } from "../5-settings/utils/config-type-utils";
import { deletePaymentAccount } from "./utils/payment-account-api-utils";
import { validateCard } from "./utils/view-payment-account-utils";

function runAddPaymentAccountTest(paymentAccountRef: string) {
  cy.loginThroughUI("user1-success");

  getPaymentAccount(paymentAccountRef).then((paymentAccountData) => {
    deletePaymentAccount(paymentAccountData);
    createOrUpdatePaymentAccountType({
      ref: paymentAccountData.accountTypeRef,
      status: "enable"
    });
  });

  cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountNavlink);
  cy.url().should("include", "/payment-accounts");
  cy.get('[data-test="add-payment-account-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();
  cy.url().should("include", "/account/add");

  cy.get('[data-loading-spinner-id="add-payment-account-not-allowed"]').should("not.exist");
  cy.get('[data-loading-spinner-id="add-payment-account-error-message"]').should("not.exist");

  getPaymentAccount(paymentAccountRef).then((pymtAccData) => {
    cy.get("#account-short-name").should("be.visible").should("have.value", "").type(pymtAccData.shortName);
    cy.get("#account-instritution-name").should("be.visible").should("have.value", "").type(pymtAccData.institutionName);
    cy.get("#account-number").should("be.visible").should("have.value", "").type(pymtAccData.accountName);
    cy.selectDropdownItem({ dropdownSelectorId: "account-type", selectNewItemText: pymtAccData.accountTypeName, requiredError: true });
    cy.selectTags({ tagsSelectorId: "pymt-acc-tags", addTagValues: pymtAccData.tags, existingTagValues: [], removeTagValues: [] });
    cy.get('[data-test="account-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#account-desc").should("be.visible").should("have.value", "").type(pymtAccData.description);
    cy.get('[data-test="account-desc-counter"]').should("be.visible").should("have.text", `counter: ${pymtAccData.description.length}/150`);
    // wait for debounce events to complete for inputs
    cy.wait(500);
  });

  cy.verifyCurrencySection();
  cy.get('button[data-test="cancel-payment-account"]').filter(":visible").should("have.length", 1).should("have.text", "Cancel");
  cy.get('button[data-test="submit-payment-account"]').filter(":visible").should("have.length", 1).should("have.text", "Add").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.waitForPageLoad();
  cy.get('[data-test="add-payment-account-error-message"]').should("not.exist");
  cy.get('section[data-test="payment-account-section"]').should("be.visible");

  cy.get('[data-test="payment-account-card"]')
    .should("have.length.at.least", 2)
    .then(($els) => {
      validateCard(paymentAccountRef, $els, true);
    });
}

describe("Payment Account - Add Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can add a new payment account successfully",
    { tags: ["payment-account", "regression", "positive", "add", "add-payment-account-tc2"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddPaymentAccountTest("primary-checking");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddPaymentAccountTest("biz-exp-checking");
      });
    }
  );
});
