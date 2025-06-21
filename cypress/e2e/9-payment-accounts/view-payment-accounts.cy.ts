import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "./utils/payment-account-api-utils";
import { validateCard } from "./utils/view-payment-account-utils";

function runPaymentAccountsTest() {
  cy.loginThroughUI("user1-success");
  createOrUpdatePaymentAccount([
    { ref: "cash", status: "enable" },
    { ref: "view-checking1", status: "enable" }
  ]);
  cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountNavlink);
  cy.url().should("include", "/payment-accounts");
  cy.get('[data-test="add-payment-account-button"]').should("be.visible");

  cy.get('section[data-test="payment-account-section"]').should("be.visible");
  cy.get('[data-test="payment-account-list-error-message"]').should("not.exist");
  cy.get('[data-test="no-payment-account-message"]').should("not.exist");
  cy.get('[data-test="payment-account-card"]')
    .should("have.length.at.least", 1)
    .then(($els) => {
      cy.wrap($els).should("be.visible");
      validateCard("cash", $els, false);
      validateCard("view-checking1", $els, true);
    });
}

describe("Payment Account - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can view payment accounts and verifies list of cards",
    { tags: ["payment-account", "regression", "positive", "view", "view-list", "view-payment-accounts-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runPaymentAccountsTest();
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runPaymentAccountsTest();
      });
    }
  );
});
