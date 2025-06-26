import { addMonths } from "date-and-time";
import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { formatTimestamp, parseTimestamp } from "../../support/date-utils";
import { getExpensePurchase, ReceiptDetailType, updateExpense } from "../../support/fixture-utils/read-expense-purchase";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccount } from "../9-payment-accounts/utils/payment-account-api-utils";
import { ReceiptContentType } from "../../support/api-resource-types";

const validatePurchaseCard = (purchaseRef: string) => {
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, "YYYY-MM-DD"), "MMM DD, YYYY");
    const verifiedTimestamp = formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), "MMM DD, YYYY");
    const belongsTo = "Purchase";
    console.log(purchaseDate, belongsTo, verifiedTimestamp);
    cy.get('[data-test="expense-card"]')
      .find('[data-test="card-header"]')
      .filter(`[data-belongs-to="${belongsTo}"][data-expense-category="${purchaseData.purchaseTypeName}"][data-billname="${purchaseData.billName}"]`)
      .filter(`[data-verified-date="${verifiedTimestamp}"]`)
      .filter(`[data-expense-date="${purchaseDate}"]`)
      .should("have.length", 1)
      .parents('[data-test="expense-card"]')
      .within(() => {
        cy.get('[data-test="expense-update-action"]').should("be.visible");
        cy.get('[data-test="expense-remove-action"]').should("be.visible");
        cy.get('[data-test="expense-view-receipts-action"]').should("be.visible");
        cy.get('[data-test="expense-add-refund-action"]').should("be.visible");
        cy.get(".card-content.is-active").should("not.be.visible");
        cy.get('[data-test="expense-expand-collapse-action"]').should("be.visible").click();
        cy.get(".card-content.is-active")
          .should("be.visible")
          .within(() => {
            const purchaseDataList = [
              { label: "Expense Belongs To", outValue: belongsTo },
              { label: "Bill Name", outValue: purchaseData.billName },
              { label: "Expense Date", outValue: purchaseDate },
              { label: "Expense Category", outValue: purchaseData.purchaseTypeName },
              { label: "Payment Account", outValue: purchaseData.paymentAccountName },
              { label: "Verified Date", outValue: verifiedTimestamp },
              { label: "Tags", outValue: purchaseData.tags.join("") },
              { label: "Share with Persons", outValue: "-" },
              { label: "Description", outValue: purchaseData.description }
            ];
            cy.get(".column").each(($cel, ind) => {
              cy.wrap($cel.find(".label")).should("be.visible").should("contain.text", purchaseDataList[ind]?.label);
              cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", purchaseDataList[ind]?.outValue);
            });
          });
      });
  });
};

const validateUploadReceiptSection = (receipts: Array<ReceiptDetailType>) => {
  cy.get(".upload-receipts-section")
    .should("be.visible")
    .within(() => {
      if (receipts.length) {
        const message = receipts.length + " receipt file" + (receipts.length > 1 ? "s are" : " is") + " uploaded";
        cy.get('[data-test="receipt-message"]').should("be.visible").should("contain.text", message);
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
              cy.get(`[data-receipt-type="${receipt.contentType}"]`, { timeout: 10 * 1000 })
                .should("be.visible")
                .should("have.descendants", "img");
              if (receipt.contentType === ReceiptContentType.PDF) {
                cy.get('[data-test="pdf"]').should("be.visible");
                cy.get('[data-test="image"]').should("not.exist");
              } else {
                cy.get('[data-test="pdf"]').should("not.exist");
                cy.get('[data-test="image"]').should("be.visible");
                cy.get('[data-test="image-zoomin"]').should("be.visible");
                cy.get('[data-test="image-zoomout"]').should("be.visible");
              }
              cy.get('[data-test="hide-fullscreen"]').should("be.visible").click();
            });
        }
      } else {
        cy.get('[data-test="container-no-receipt-message"]').should("be.visible").should("have.text", "There are no receipts");
        cy.get('[data-test="receipt-view"]').should("not.exist");
      }
      cy.get('[data-test="container-close-action"]').should("be.visible").click();
    });
};

const selectUploadReceipts = (receipts: Array<ReceiptDetailType>) => {
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

const validatePurchaseDate = (purchaseDateFromData: string | Date) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const purchaseDate = purchaseDateFromData instanceof Date ? purchaseDateFromData : parseTimestamp(purchaseDateFromData, "YYYY-MM-DD");
      cy.get(".datetimepicker-header")
        .should("be.visible")
        .within(() => {
          cy.get(".datetimepicker-selection-day").should("have.text", purchaseDate.getDate());
          cy.get(".datetimepicker-selection-month").should("have.text", formatTimestamp(purchaseDate, "MMMM YYYY"));
        });
    });
};

const selectPurchaseDate = (options: { newPurchaseDate: string; existingPurchaseDate: string | Date }) => {
  cy.get('[data-test="calendar-field"]')
    .should("be.visible")
    .within(() => {
      const purchaseDate =
        options.existingPurchaseDate instanceof Date ? options.existingPurchaseDate : parseTimestamp(options.existingPurchaseDate, "YYYY-MM-DD");

      cy.get(".datepicker-nav").within(() => {
        // validate navigation - next & prev month
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(purchaseDate, "MMMM"));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", purchaseDate.getFullYear());
      });

      cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-previous").should("be.visible").click();
        const previousMonthPurchaseDate = addMonths(purchaseDate, -1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(previousMonthPurchaseDate, "MMMM"));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", previousMonthPurchaseDate.getFullYear());
      });

      cy.get(".datetimepicker-footer-today").should("be.visible").click();
      cy.get(".datepicker-nav").within(() => {
        cy.get(".datepicker-nav-next").should("be.visible").click();
        const nextMonthPurchaseDate = addMonths(purchaseDate, 1);
        cy.get(".datepicker-nav-month").should("be.visible").should("have.text", formatTimestamp(nextMonthPurchaseDate, "MMMM"));
        cy.get(".datepicker-nav-year").should("be.visible").should("have.text", nextMonthPurchaseDate.getFullYear());
      });
      const preferredPurchaseDate = parseTimestamp(options.newPurchaseDate, "YYYY-MM-DD");
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
      cy.get(".datepicker-nav-month").should("have.text", formatTimestamp(preferredPurchaseDate, "MMMM"));
      // select preferred date
      cy.get(".datepicker-dates")
        .should("be.visible")
        .within(() => {
          cy.get(".datepicker-date").should("have.length.at.least", 31).filter(`:contains("${preferredPurchaseDate.getDate()}")`).last().click();
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

function validateAndToggleVerifyIndicator(existingVerifiedTimestamp: string, toggleVerification: boolean) {
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
          cy.get("button[data-verified-date]").should("have.attr", "data-verified-date", formatTimestamp(new Date(), "MMM DD, YYYY"));
        }
      } else {
        if (!existingVerifiedTimestamp) {
          cy.get('[data-test="unverified-button"]').should("be.visible").should("contain.text", "Purchase  un-verified");
          cy.get("button[data-verified-date]").should("not.exist");
        } else {
          cy.get('[data-test="verified-button"]').should("be.visible").should("contain.text", "Purchase  verified");
          const date = parseTimestamp(existingVerifiedTimestamp);
          cy.get("button[data-verified-date]").should("have.attr", "data-verified-date", formatTimestamp(date, "MMM DD, YYYY"));
        }
      }
    });
}

function runAddPurchaseTest(purchaseRef: string) {
  cy.loginThroughUI("user1-success");
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
  });
  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.url().should("include", "/expense-journal");
  cy.get('[data-test="add-income-button"]').should("be.visible");
  cy.get('[data-test="add-refund-button"]').should("be.visible");
  cy.get('[data-test="add-purchase-button"]').should("be.visible").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");
  cy.url().should("include", "/purchase/add");
  cy.get('[data-loading-spinner-id="add-purchase-not-allowed"]').should("not.exist");
  cy.get('[data-loading-spinner-id="add-purchase-error-message"]').should("not.exist");

  getExpensePurchase(purchaseRef).then((purchaseData) => {
    cy.get("#purchase-bill-name").should("be.visible").should("have.value", "").type(purchaseData.billName);
    cy.get("#purchase-amount").should("be.visible").should("have.value", "").type(purchaseData.amount);
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-pymt-acc", selectNewItemText: purchaseData.paymentAccountName });
    cy.selectDropdownItem({ dropdownSelectorId: "purchase-type", selectNewItemText: purchaseData.purchaseTypeName });
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: 0/150`);
    cy.get("#purchase-desc").should("be.visible").should("have.value", "").type(purchaseData.description);
    cy.get('[data-test="purchase-desc-counter"]').should("be.visible").should("have.text", `counter: ${purchaseData.description.length}/150`);
    cy.selectTags({ tagsSelectorId: "purchase-tags", addTagValues: purchaseData.tags, existingTagValues: [], removeTagValues: [] });
    validateAndToggleVerifyIndicator("", true);
    updateExpense(purchaseRef, { ...purchaseData, verifiedTimestamp: formatTimestamp(new Date()) });

    console.log("updated data", purchaseData);
    selectPurchaseDate({ newPurchaseDate: purchaseData.purchaseDate, existingPurchaseDate: new Date() });
    validatePurchaseDate(purchaseData.purchaseDate);

    validateUploadReceiptSection([]);
    selectUploadReceipts(purchaseData.receipts);

    // wait for debounce events to complete for inputs
    cy.wait(500);
  });
  cy.verifyCurrencySection();

  cy.get('button[data-test="cancel-purchase"]').should("be.visible").should("have.text", "Cancel");
  cy.get('button[data-test="submit-purchase"]').filter(":visible").should("be.visible").should("have.text", "Add").click();
  cy.get('[data-loading-spinner-id="page-route"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]').should("not.be.visible");

  cy.get('[data-test="add-purchase-error-message"]').should("not.exist");
  cy.get('section[data-test="expense-list-view"]').should("be.visible");
}

describe("Expense - Add Purchase Flow", () => {
  beforeEach(() => {
    // to force call api instead of testing on cache data
    cy.deleteIndexedDb(IndexedDbName.Expense);
  });

  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in and active user can add a new purchase successfully",
    { tags: ["expense", "purchase", "regression", "positive", "add", "add-purchase-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runAddPurchaseTest("local-grocery1");
        validatePurchaseCard("local-grocery1");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runAddPurchaseTest("local-grocery2");
      });
    }
  );
});
