import { ExpenseBelongsTo, ReceiptContentType } from "../../../support/api-resource-types";
import {
  addMonths,
  expenseDateFormatFixture,
  formatTimestamp,
  fullMonthFormat,
  fullMonthFullYearFormat,
  parseTimestamp
} from "../../../support/date-utils";
import { ReceiptDetailType } from "../../../support/fixture-utils/read-expense-purchase";

export const selectExpenseDate = (options: { newExpenseDate: string; existingExpenseDate: string | Date }) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const expenseDate =
        options.existingExpenseDate instanceof Date
          ? options.existingExpenseDate
          : parseTimestamp(options.existingExpenseDate, expenseDateFormatFixture);

      cy.get(".datepicker-nav").within(() => {
        // validate navigation - next & prev month
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(expenseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", expenseDate.getFullYear());
      });

      // cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-previous").should("be.visible").click();
        const previousMonthExpenseDate = addMonths(expenseDate, -1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(previousMonthExpenseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", previousMonthExpenseDate.getFullYear());
      });

      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-next").should("be.visible").click().click();
        const nextMonthExpenseDate = addMonths(expenseDate, 1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(nextMonthExpenseDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", nextMonthExpenseDate.getFullYear());
      });
      cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        const todayDate = new Date();
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(todayDate, fullMonthFormat));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", todayDate.getFullYear());
      });

      const preferredExpenseDate = parseTimestamp(options.newExpenseDate, expenseDateFormatFixture);
      // validate years and select preferred year
      cy.get(".datepicker-nav .datepicker-nav-year").click();
      cy.get(".datepicker-body .datepicker-years")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-year")
            .should("have.length", 6)
            .filter(`[data-year="${preferredExpenseDate.getFullYear()}"]`)
            .should("be.visible")
            .click();
        });
      cy.get(".datepicker-nav-year").should("have.text", preferredExpenseDate.getFullYear());
      // select preferred month
      cy.get(".datepicker-nav .datepicker-nav-month").click();
      cy.get(".datepicker-body .datepicker-months")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-month")
            .should("have.length", 12)
            .filter(`[data-month="${((preferredExpenseDate.getMonth() + 1) / 100).toFixed(2).substring(2)}"]`)
            .should("be.visible")
            .click();
        });
      cy.get(".datepicker-nav-month").should("have.text", formatTimestamp(preferredExpenseDate, fullMonthFormat));
      // select preferred date
      cy.get(".datepicker-dates")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-date").should("have.length.at.least", 31).filter(`:contains("${preferredExpenseDate.getDate()}")`).last().click();
        });
    });
};

export const validateExpenseDateInForm = (expenseDateFromData: string | Date) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const expenseDate = expenseDateFromData instanceof Date ? expenseDateFromData : parseTimestamp(expenseDateFromData, expenseDateFormatFixture);
      cy.get(".datetimepicker-header")
        .should("be.visible")
        .within(() => {
          cy.get(".datetimepicker-selection-day").should("have.text", expenseDate.getDate());
          cy.get(".datetimepicker-selection-month").should("have.text", formatTimestamp(expenseDate, fullMonthFullYearFormat));
        });
    });
};

export const validateUploadReceiptSection = (receipts: Array<ReceiptDetailType>, belongsToLabel: string) => {
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
      cy.get('[data-test="container-header-title"]').should("be.visible").should("have.text", `View / Upload ${belongsToLabel} Receipts`);
      cy.get('[data-test="container-header-close-action"]').should("be.visible").click();

      cy.get('[data-test="container-header-title"]').should("not.be.visible");
      cy.get('[data-test="container-open-action"]').should("be.visible").click();

      if (receipts.length) {
        // cy.get('[data-test="download-receipt"]').should("have.length.at.least", 1);
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

export const selectUploadReceipts = (receipts: Array<ReceiptDetailType>, belongsTo: ExpenseBelongsTo, belongsToLabel: string) => {
  cy.get(".upload-receipts-section")
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="container-open-action"]').should("be.visible").click();
      for (let receipt of receipts) {
        cy.get('[data-test="file-receipts"]')
          .should("be.visible")
          .find('input[type="file"]')
          .selectFile(`cypress/fixtures/expenses/${belongsTo}/${receipt.name}`, { force: true });
        cy.get('[data-test="receipt-select-error"]').should("not.exist");
      }
      cy.get('[data-test="receipt-view"]').should("have.length.at.least", receipts.length);
      cy.get('[data-test="container-close-action"]').should("be.visible").click();
    });
  validateUploadReceiptSection(receipts, belongsToLabel);
};
