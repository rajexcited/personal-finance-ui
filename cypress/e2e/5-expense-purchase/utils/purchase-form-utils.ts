import { dateFormatLabel, formatTimestamp, parseTimestamp } from "../../../support/date-utils";

const verifyIndicatorConfirmDialog = (
  existingVerifiedTimestamp: string,
  confirmActionDataSelector: "close-confirm-button" | "no-confirm-button" | "yes-confirm-button"
) => {
  if (!existingVerifiedTimestamp) {
    cy.get("button[data-verified-date]").should("not.exist");
    cy.get('[data-test="unverified-button"]').should("be.visible").should("contain.text", "Purchase  un-verified").click();
  } else {
    cy.get("button[data-verified-date]").should("have.attr", "data-verified-date", existingVerifiedTimestamp);
    cy.get('[data-test="verified-button"]').should("be.visible").should("contain.text", "Purchase  verified").click();
  }

  cy.get("#purchase-verify-indicator-verify-confirm-dialog")
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="close-confirm-button"]').should("be.visible");
      cy.get('[data-test="no-confirm-button"]').should("be.visible").should("contain.text", "No");
      cy.get('[data-test="yes-confirm-button"]').should("be.visible").should("contain.text", "Yes");
      if (!existingVerifiedTimestamp) {
        cy.get(".modal-card-body").should("be.visible").should("contain.text", "Do you want to verify this expense manually?");
      } else {
        cy.get(".modal-card-body").should("be.visible").should("contain.text", "Really, Do you want to un-verify this expense?");
      }

      cy.get('[data-test="' + confirmActionDataSelector + '"]')
        .should("be.visible")
        .click();
    });
};

export const validateAndToggleVerifyIndicator = (existingVerifiedTimestamp: string, toggleVerification: boolean) => {
  cy.get('[data-test="purchase-verify-indicator"]')
    .should("be.visible")
    .within(() => {
      if (toggleVerification) {
        verifyIndicatorConfirmDialog(existingVerifiedTimestamp, "close-confirm-button");
        verifyIndicatorConfirmDialog(existingVerifiedTimestamp, "no-confirm-button");
        verifyIndicatorConfirmDialog(existingVerifiedTimestamp, "yes-confirm-button");
        if (existingVerifiedTimestamp) {
          cy.get('[data-test="unverified-button"]').should("be.visible").should("contain.text", "Purchase  un-verified");
          cy.get("button[data-verified-date]").should("not.exist");
        } else {
          cy.get('[data-test="verified-button"]').should("be.visible").should("contain.text", "Purchase  verified");
          cy.get("button[data-verified-date]").should("have.attr", "data-verified-date", formatTimestamp(new Date(), dateFormatLabel));
        }
      } else {
        if (!existingVerifiedTimestamp) {
          cy.get('[data-test="unverified-button"]').should("be.visible").should("contain.text", "Purchase  un-verified");
          cy.get("button[data-verified-date]").should("not.exist");
        } else {
          cy.get('[data-test="verified-button"]').should("be.visible").should("contain.text", "Purchase  verified");
          const date = parseTimestamp(existingVerifiedTimestamp);
          cy.get("button[data-verified-date]").should("have.attr", "data-verified-date", formatTimestamp(date, dateFormatLabel));
        }
      }
    });
};
