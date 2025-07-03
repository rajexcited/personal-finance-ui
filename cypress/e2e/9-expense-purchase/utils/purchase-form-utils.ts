import { ReceiptContentType } from "../../../support/api-resource-types";
import {
  addMonths,
  dateFormatLabel,
  formatTimestamp,
  fullMonthFormat,
  fullMonthFullYearFormat,
  parseTimestamp,
  purchaseDateFormatFixture
} from "../../../support/date-utils";
import { ReceiptDetailType } from "../../../support/fixture-utils/read-expense-purchase";

export const validateUploadReceiptSection = (receipts: Array<ReceiptDetailType>) => {
  cy.get(".upload-receipts-section")
    .should("be.visible")
    .within(() => {
      if (receipts.length) {
        cy.get('[data-test="valid-receipt-message"]')
          .should("be.visible")
          .should("contain.text", receipts.length + " uploaded");
        cy.get('[data-test="invalid-receipt-message"]').should("not.exist");
      } else {
        cy.get('[data-test="no-receipt-message"]').should("be.visible").should("have.text", "No receipt uploaded");
      }
      cy.get(".fullscreen-image-container").should("exist").should("not.be.visible");
      cy.get('[data-test="container-open-action"]').should("be.visible").click();
      cy.get('[data-test="container-header-title"]').should("be.visible").should("have.text", "View / Upload Purchase Receipts");
      cy.get('[data-test="container-header-close-action"]').should("be.visible").click();

      cy.get('[data-test="container-header-title"]').should("not.be.visible");
      cy.get('[data-test="container-open-action"]').should("be.visible").click();

      if (receipts.length) {
        cy.get('[data-test="download-receipt"]').should("have.length.at.least", 1);
        cy.get('[data-test="container-no-receipt-message"]').should("not.exist");
        cy.get('[data-test="receipt-view"]').should("have.length", receipts.length);
        for (let receipt of receipts) {
          cy.get(`[data-receipt-filename="${receipt.name}"]`)
            .should("be.visible")
            .within(() => {
              cy.get('[data-test="receipt-title"]').should("be.visible").should("have.text", receipt.name);
              cy.get('[data-test="receipt-delete-action"]').should("be.visible");
              cy.get('[data-test="receipt-fullscreen"]').should("be.visible");
              cy.get('[data-test="receipt-fullscreen-view-action"]').should("be.visible").should("have.text", "View").click();
            });
          cy.get(".fullscreen-image-container")
            .should("be.visible")
            .within(() => {
              if (receipt.contentType === ReceiptContentType.PDF) {
                cy.get(`[data-receipt-type="${receipt.contentType}"]`, { timeout: 10 * 1000 }).should("be.visible");
                cy.get('[data-test="pdf"]').should("be.visible");
                cy.get('[data-test="image"]').should("not.exist");
              } else {
                cy.get(`[data-receipt-type="${receipt.contentType}"]`, { timeout: 10 * 1000 })
                  .should("be.visible")
                  .should("have.descendants", "img");
                cy.get('[data-test="pdf"]').should("not.exist");
                cy.get('[data-test="image"]').should("be.visible");
                cy.get('[data-test="image-zoomin"]').should("be.visible");
                cy.get('[data-test="image-zoomout"]').should("be.visible");
              }
              cy.get('[data-test="hide-fullscreen"]').should("be.visible").click();
            });
        }
      } else {
        cy.get('[data-test="download-receipt"]').should("not.exist");
        cy.get('[data-test="container-no-receipt-message"]').should("be.visible").should("have.text", "There are no receipts");
        cy.get('[data-test="receipt-view"]').should("not.exist");
      }
      cy.get('[data-test="container-close-action"]').should("be.visible").click();
    });
};

export const selectUploadReceipts = (receipts: Array<ReceiptDetailType>) => {
  cy.get(".upload-receipts-section")
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="container-open-action"]').should("be.visible").click();
      for (let receipt of receipts) {
        cy.get('[data-test="file-receipts"]')
          .should("be.visible")
          .find('input[type="file"]')
          .selectFile(`cypress/fixtures/expenses/purchase/${receipt.name}`, { force: true });
        cy.get('[data-test="receipt-select-error"]').should("not.exist");
      }
      cy.get('[data-test="receipt-view"]').should("have.length.at.least", receipts.length);
      cy.get('[data-test="container-close-action"]').should("be.visible").click();
    });
  validateUploadReceiptSection(receipts);
};

export const selectPurchaseDate = (options: { newPurchaseDate: string; existingPurchaseDate: string | Date }) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const purchaseDate =
        options.existingPurchaseDate instanceof Date
          ? options.existingPurchaseDate
          : parseTimestamp(options.existingPurchaseDate, purchaseDateFormatFixture);

      cy.get(".datepicker-nav").within(() => {
        // validate navigation - next & prev month
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(purchaseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", purchaseDate.getFullYear());
      });

      // cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-previous").should("be.visible").click();
        const previousMonthPurchaseDate = addMonths(purchaseDate, -1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(previousMonthPurchaseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", previousMonthPurchaseDate.getFullYear());
      });

      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-next").should("be.visible").click().click();
        const nextMonthPurchaseDate = addMonths(purchaseDate, 1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(nextMonthPurchaseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", nextMonthPurchaseDate.getFullYear());
      });
      cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        const todayDate = new Date();
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(todayDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", todayDate.getFullYear());
      });

      const preferredPurchaseDate = parseTimestamp(options.newPurchaseDate, purchaseDateFormatFixture);
      // validate years and select preferred year
      cy.get(".datepicker-nav .datepicker-nav-year").click();
      cy.get(".datepicker-body .datepicker-years")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-year")
            .should("have.length", 6)
            .filter(`[data-year="${preferredPurchaseDate.getFullYear()}"]`)
            .should("be.visible")
            .click();
        });
      cy.get(".datepicker-nav-year").should("have.text", preferredPurchaseDate.getFullYear());
      // select preferred month
      cy.get(".datepicker-nav .datepicker-nav-month").click();
      cy.get(".datepicker-body .datepicker-months")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-month")
            .should("have.length", 12)
            .filter(`[data-month="${((preferredPurchaseDate.getMonth() + 1) / 100).toFixed(2).substring(2)}"]`)
            .should("be.visible")
            .click();
        });
      cy.get(".datepicker-nav-month").should("have.text", formatTimestamp(preferredPurchaseDate, fullMonthFormat));
      // select preferred date
      cy.get(".datepicker-dates")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-date").should("have.length.at.least", 31).filter(`:contains("${preferredPurchaseDate.getDate()}")`).last().click();
        });
    });
};

export const validatePurchaseDateInForm = (purchaseDateFromData: string | Date) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const purchaseDate =
        purchaseDateFromData instanceof Date ? purchaseDateFromData : parseTimestamp(purchaseDateFromData, purchaseDateFormatFixture);
      cy.get(".datetimepicker-header")
        .should("be.visible")
        .within(() => {
          cy.get(".datetimepicker-selection-day").should("have.text", purchaseDate.getDate());
          cy.get(".datetimepicker-selection-month").should("have.text", formatTimestamp(purchaseDate, fullMonthFullYearFormat));
        });
    });
};

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
