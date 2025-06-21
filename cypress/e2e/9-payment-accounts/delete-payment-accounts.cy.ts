import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { getPaymentAccount } from "../../support/read-payment-account";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "./utils/payment-account-api-utils";
import { getPaymentAccountCard, validateCard } from "./utils/view-payment-account-utils";

const verifyViewPaymentAccountCard = (existingPaymentAccountRef: string) => {
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

const verifyDeleteConfirmDialog = (
  $filteredCard: JQuery<HTMLElement>,
  confirmActionDataSelector: "close-confirm-button" | "no-confirm-button" | "yes-confirm-button",
  waitForLoading: boolean
) => {
  cy.wrap($filteredCard).within(() => {
    cy.get('[data-test="card-header-action-delete"]').should("be.visible").click();
  });
  cy.get("#delete-pymt-acc-confirm-dialog")
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="close-confirm-button"]').should("be.visible");
      cy.get(".modal-card-title").should("be.visible").should("have.text", "Remove Payment Account");
      cy.get(".modal-card-body").should("be.visible").should("contain.text", "Are you sure that you want to delete payment account?");

      cy.get('[data-test="no-confirm-button"]').should("be.visible").should("contain.text", "No");
      cy.get('[data-test="yes-confirm-button"]').should("be.visible").should("contain.text", "Yes");
      cy.get('[data-test="' + confirmActionDataSelector + '"]')
        .should("be.visible")
        .click();
    });

  cy.get("#delete-pymt-acc-confirm-dialog").should("not.be.visible");

  if (waitForLoading) {
    cy.get('[data-test="loading-spinner"]').should("be.visible");
    cy.get('[data-loading-spinner-id="page-route"]', { timeout: 60 * 1000 }).should("not.be.visible");
    cy.wrap($filteredCard).should("not.exist");
  } else {
    cy.get('[data-test="loading-spinner"]').should("not.be.visible");
    cy.wrap($filteredCard).should("be.visible");
  }
};

function runDeletePaymentAccountTest(paymentAccountRef: string) {
  cy.loginThroughUI("user1-success");
  createOrUpdatePaymentAccount([{ ref: paymentAccountRef, status: "enable" }]);
  cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountNavlink);
  verifyViewPaymentAccountCard(paymentAccountRef);

  getPaymentAccount(paymentAccountRef).then((existingPaymentAccountData) => {
    cy.get('[data-test="payment-account-card"]').then(($cardElementList) => {
      const initialCardCount = $cardElementList.length;
      getPaymentAccountCard($cardElementList, existingPaymentAccountData.shortName).then((filteredElement) => {
        verifyDeleteConfirmDialog(filteredElement, "close-confirm-button", false);
        verifyDeleteConfirmDialog(filteredElement, "no-confirm-button", false);
        verifyDeleteConfirmDialog(filteredElement, "yes-confirm-button", true);
      });
      cy.get('[data-test="payment-account-card"]').should("have.length", initialCardCount - 1);
    });
  });
  cy.get('[data-test="payment-account-card"]').each(($cardElement) => {
    cy.wrap($cardElement).within(() => {
      cy.get('[data-test="card-header-action-update"]').should("be.visible");
      if ($cardElement.find(".card-header-title").text().includes("cash")) {
        cy.get('[data-test="card-header-action-delete"]').should("not.exist");
      } else {
        cy.get('[data-test="card-header-action-delete"]').should("be.visible");
      }
      cy.get('[data-test="card-header-action-expand-collapse"]').should("be.visible");
    });
  });
  cy.get('[data-test="payment-account-list-error-message"]').should("not.exist");
  cy.get('section[data-test="payment-account-section"]').should("be.visible");
  cy.get('[data-test="no-payment-account-message"]').should("not.exist");
}

describe("Payment Account - Delete Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can delete an existing payment account successfully (except cash)",
    { tags: ["payment-account", "regression", "positive", "delete", "delete-payment-account-tc6"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runDeletePaymentAccountTest("amazon-giftcard");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runDeletePaymentAccountTest("auto-loan");
      });
    }
  );
});
