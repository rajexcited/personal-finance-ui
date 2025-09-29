import { ExpenseBelongsTo, ReceiptContentType } from "../../../support/api-resource-types";
import {
  dateFormatLabel,
  dateTimestampFormatApi,
  expenseDateFormatFixture,
  formatTimestamp,
  parseTimestamp,
  subtractDates
} from "../../../support/date-utils";
import { ExpenseIncomeDetailType, getExpenseIncome } from "../../../support/fixture-utils/read-expense-income";
import { ExpensePurchaseDetailType, getExpensePurchase, ReceiptDetailType } from "../../../support/fixture-utils/read-expense-purchase";
import { ExpenseRefundDetailType, getExpenseRefund } from "../../../support/fixture-utils/read-expense-refund";
import { UnSupportedError } from "../../../support/resource-types";

export type ValidateExpenseCallbackFn = (belongsTo: ExpenseBelongsTo, ref: string) => Cypress.Chainable<JQuery<HTMLElement>>;
export type UnionExpenseDetailType = ExpensePurchaseDetailType | ExpenseIncomeDetailType | ExpenseRefundDetailType;

export const getExpense = (belongsTo: ExpenseBelongsTo, ref: string): Cypress.Chainable<any> => {
  if (belongsTo === ExpenseBelongsTo.Purchase) {
    return getExpensePurchase(ref) as Cypress.Chainable<ExpensePurchaseDetailType>;
  }
  if (belongsTo === ExpenseBelongsTo.Income) {
    return getExpenseIncome(ref) as Cypress.Chainable<ExpenseIncomeDetailType>;
  }
  if (belongsTo === ExpenseBelongsTo.Refund) {
    return getExpenseRefund(ref) as Cypress.Chainable<ExpenseRefundDetailType>;
  }
  throw new UnSupportedError(belongsTo + " not configured in fixture");
};

const getExpenseDateInstance = (expenseData: UnionExpenseDetailType) => {
  let expenseDateFromData: string | null = null;
  if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
    expenseDateFromData = expenseData.purchaseDate;
  } else if (expenseData.belongsTo === ExpenseBelongsTo.Income) {
    expenseDateFromData = expenseData.incomeDate;
  } else if (expenseData.belongsTo === ExpenseBelongsTo.Refund) {
    expenseDateFromData = expenseData.refundDate;
  }

  if (expenseDateFromData) {
    const dateInstance = parseTimestamp(expenseDateFromData, expenseDateFormatFixture);
    if (isNaN(dateInstance.getTime())) {
      throw new UnSupportedError(
        `date for ${expenseData.belongsTo} is not in expected format[${expenseDateFormatFixture}]. actual date[${expenseDateFromData}]`
      );
    }
    return dateInstance;
  }
  throw new UnSupportedError("date not available");
};

export const getExpenseDateFormatLabel = (expenseData: UnionExpenseDetailType) => {
  const dateInstance = getExpenseDateInstance(expenseData);
  const dateLabel = formatTimestamp(dateInstance, dateFormatLabel);
  return dateLabel;
};

const getVerifiedTimestampLabel = (expenseData: UnionExpenseDetailType) => {
  let verifiedTimestampInstance: Date | null = null;
  if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
    verifiedTimestampInstance = parseTimestamp(expenseData.verifiedTimestamp);
  }
  if (verifiedTimestampInstance && !isNaN(verifiedTimestampInstance.getTime())) {
    const verifiedTimestampLabel = formatTimestamp(verifiedTimestampInstance, dateFormatLabel);
    return verifiedTimestampLabel;
  }
  return "-";
};

const getExpenseCategoryName = (expenseData: UnionExpenseDetailType) => {
  const belongsTo = expenseData.belongsTo;
  if (belongsTo === ExpenseBelongsTo.Purchase) {
    return expenseData.purchaseTypeName;
  }
  if (belongsTo === ExpenseBelongsTo.Income) {
    return expenseData.incomeTypeName;
  }
  if (belongsTo === ExpenseBelongsTo.Refund) {
    return expenseData.reasonName;
  }
  throw new UnSupportedError(`cannot get category name for ${belongsTo}`);
};

export const getBelongsToLabel = (belongsTo: ExpenseBelongsTo) => {
  if (belongsTo === ExpenseBelongsTo.Purchase) {
    return "Purchase";
  }
  if (belongsTo === ExpenseBelongsTo.Income) {
    return "Income";
  }
  if (belongsTo === ExpenseBelongsTo.Refund) {
    return "Refund";
  }
  throw new UnSupportedError(belongsTo + " is not matched");
};

/**
 * Loads more expenses if the target expense is older than 6 months.
 * This function needs to be called before validating specific expense elements
 * because the load-more button is outside the scope of individual cards/rows.
 */
const loadMoreExpenses = (expenseData: UnionExpenseDetailType) => {
  const expenseDateInstance = getExpenseDateInstance(expenseData);
  const monthsSinceExpense = (subtractDates(new Date(), expenseDateInstance)?.toDays() || 0) / 30;

  if (monthsSinceExpense > 6) {
    cy.get('[data-test="load-more-expense-action"]').scrollIntoView();
    cy.get('[data-test="load-more-expense-action"]').should("be.visible").should("be.enabled").click();
    cy.waitForPageLoad();
    const pageMonths = 3;
    let pageMonthsAccumulated = pageMonths - 6;
    do {
      cy.get('[data-test="load-more-expense-action"]').scrollIntoView().should("be.visible").should("be.enabled").click();
      pageMonthsAccumulated -= pageMonths;
    } while (pageMonthsAccumulated > 0);
  }
};

export const validateExpenseCardOnSmall = (belongsTo: ExpenseBelongsTo, ref: string) => {
  cy.get('[data-test="expense-list-view"]').should("be.visible");
  cy.get('[data-test="expense-list-error-message"]').should("not.be.visible");
  getExpense(belongsTo, ref).then((data) => {
    const expenseData = data as UnionExpenseDetailType;
    const expenseDateLabel = getExpenseDateFormatLabel(expenseData);
    const verifiedTimestamp = getVerifiedTimestampLabel(expenseData);
    const expenseCategoryName = getExpenseCategoryName(expenseData);
    const belongsToLabel = getBelongsToLabel(expenseData.belongsTo);

    // Load more expenses BEFORE validating the specific card to ensure it's available
    loadMoreExpenses(expenseData);
    // cy.pause();
    // Find and validate the expense card that matches our criteria
    cy.get('[data-test="expense-card"]')
      .find('[data-test="card-header"]')
      .filter(`[data-belongs-to="${belongsToLabel}"]`)
      .filter(`[data-expense-category="${expenseCategoryName}"]`)
      .filter(`[data-billname="${expenseData.billName}"]`)
      .filter(`[data-verified-date="${verifiedTimestamp}"]`)
      .filter(`[data-expense-date="${expenseDateLabel}"]`)
      .filter(($ind, $card) => {
        const rowUpdatedOnTime = parseTimestamp($card.getAttribute("data-updated-on") || "", dateTimestampFormatApi);
        // should have been updated in recent 30 seconds
        const testStartTime = new Date(Cypress.env("testStartTime"));
        // console.log("testStartTime =", testStartTime, ", rowUpdatedOnTime =", rowUpdatedOnTime);
        if (rowUpdatedOnTime > testStartTime) {
          // console.log("matching criteria");
          return true;
        }
        // console.log("doesn't match criteria");
        return false;
      })
      .should("have.length", 1)
      .parents('[data-test="expense-card"]')
      .as("actionContainer")
      .within(() => {
        cy.get('[data-test="expense-update-action"]').should("be.visible");
        cy.get('[data-test="expense-remove-action"]').should("be.visible");
        if (expenseData.receipts.length) {
          cy.get('[data-test="expense-view-receipts-action"]').should("be.visible");
        } else {
          cy.get('[data-test="expense-view-receipts-action"]').should("not.exist");
        }
        if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
          cy.get('[data-test="expense-add-refund-action"]').should("be.visible");
        } else {
          cy.get('[data-test="expense-add-refund-action"]').should("not.exist");
        }
        cy.get(".card-content.is-active").should("not.be.visible");
        cy.get('[data-test="expense-expand-collapse-action"]').should("be.visible").click();
        cy.get(".card-content.is-active")
          .should("be.visible")
          .within(() => {
            const expenseDataList = [
              { label: "Expense Belongs To", outValue: belongsToLabel },
              { label: "Bill Name", outValue: expenseData.billName },
              { label: "Expense Date", outValue: expenseDateLabel },
              { label: "Expense Category", outValue: expenseCategoryName },
              { label: "Payment Account", outValue: expenseData.paymentAccountName }
            ];
            if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
              expenseDataList.push({ label: "", outValue: verifiedTimestamp === "-" ? "Purchase un-verified" : verifiedTimestamp });
            }
            expenseDataList.push(
              { label: "Tags", outValue: expenseData.tags.join("").replace(" ", "-") },
              { label: "Share with Persons", outValue: "-" },
              { label: "Description", outValue: expenseData.description }
            );

            cy.get(".column").each(($cel, ind) => {
              if (expenseDataList[ind]?.label) {
                cy.wrap($cel.find(".label")).should("be.visible").should("contain.text", expenseDataList[ind]?.label);
              }
              cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", expenseDataList[ind]?.outValue);
            });
          });
      });
  });
  validateReceiptCarousel(belongsTo, ref);
  return cy.get("@actionContainer");
};

export const validateExpenseTableRowOnLarge = (belongsTo: ExpenseBelongsTo, ref: string) => {
  cy.get('[data-test="expense-list-view"]').should("be.visible");
  cy.get('[data-test="expense-list-error-message"]').should("not.be.visible");

  cy.get('[data-test="load-more-expense-action"]').should("be.enabled");

  getExpense(belongsTo, ref).then((data) => {
    const expenseData = data as UnionExpenseDetailType;

    // Load more expenses BEFORE validating the specific table row to ensure it's available
    loadMoreExpenses(expenseData);

    // validate headers
    const headerLabels = [
      { label: "Type", isSortable: true },
      { label: "Expense Date", isSortable: true },
      { label: "Payment Account", isSortable: true },
      { label: "Bill Name", isSortable: true },
      { label: "Amount", isSortable: true },
      { label: "Category", isSortable: false },
      { label: "Tags", isSortable: false },
      { label: "Actions", isSortable: false }
    ];
    cy.get('[data-test="expense-table"]')
      .should("be.visible")
      .within(() => {
        cy.get("thead th")
          .should("have.length", headerLabels.length)
          .each(($th, $ind) => {
            if (headerLabels[$ind].isSortable) {
              cy.wrap($th).should("be.visible").should("contain.text", headerLabels[$ind].label).find(".icon").should("exist");
            } else {
              cy.wrap($th).should("be.visible").should("contain.text", headerLabels[$ind].label).find(".icon").should("not.exist");
            }
          });

        const expenseDateLabel = getExpenseDateFormatLabel(expenseData);
        const expenseCategoryName = getExpenseCategoryName(expenseData);
        const belongsToLabel = getBelongsToLabel(expenseData.belongsTo);

        cy.get('tr[data-test="expense-row"]')
          .filter(`[data-belongs-to="${belongsToLabel}"]`)
          .filter(`[data-expense-category="${expenseCategoryName}"]`)
          .filter(`[data-billname="${expenseData.billName}"]`)
          .filter(`[data-expense-date="${expenseDateLabel}"]`)
          .filter(($ind, $tr) => {
            const rowUpdatedOnTime = parseTimestamp($tr.getAttribute("data-updated-on") || "", dateTimestampFormatApi);
            // should have been updated in recent 30 seconds
            const testStartTime = new Date(Cypress.env("testStartTime"));
            // console.log("testStartTime =", testStartTime, ", rowUpdatedOnTime =", rowUpdatedOnTime);
            if (rowUpdatedOnTime > testStartTime) {
              // console.log("matching criteria");
              return true;
            }
            // console.log("doesn't match criteria");
            return false;
          })
          .should("have.length.at.least", 1)
          .first()
          .within(() => {
            const expenseDataList = [
              belongsToLabel,
              expenseDateLabel,
              expenseData.paymentAccountName,
              expenseData.billName,
              `$ ${expenseData.amount}`,
              expenseCategoryName
            ];
            const tags = expenseData.tags.join(",").replace(" ", "-");
            if (tags.length > 15) {
              expenseDataList.push(tags.substring(0, 12) + "...");
            } else {
              expenseDataList.push(tags);
            }
            cy.get("td").each(($td, ind) => {
              if (ind < expenseDataList.length) {
                cy.wrap($td).should("be.visible").should("contain.text", expenseDataList[ind]);
              }
            });
            cy.get("td")
              .last()
              .as("actionContainer")
              .should("be.visible")
              .within(() => {
                cy.get('[data-test="expense-update-action"]').should("be.visible");
                cy.get('[data-test="expense-remove-action"]').should("be.visible");
                if (expenseData.receipts.length) {
                  cy.get('[data-test="expense-view-receipts-action"]').should("be.visible");
                } else {
                  cy.get('[data-test="expense-view-receipts-action"]').should("not.exist");
                }
                if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
                  cy.get('[data-test="expense-add-refund-action"]').should("be.visible");
                } else {
                  cy.get('[data-test="expense-add-refund-action"]').should("not.exist");
                }
              });
          });
      });
  });
  validateReceiptCarousel(belongsTo, ref);
  return cy.get("@actionContainer");
};

const validateReceiptCarousel = (belongsTo: ExpenseBelongsTo, ref: string) => {
  getExpense(belongsTo, ref).then((data) => {
    const expenseData = data as UnionExpenseDetailType;
    cy.get('[data-test="receipts-carousel"]')
      .should("be.visible")
      .within(() => {
        cy.get('[data-test="dummy-item"').should("exist").should("not.be.visible");
      });

    cy.get("@actionContainer").then(($actionContainer) => {
      cy.wrap($actionContainer).within(() => {
        if (expenseData.receipts.length) {
          cy.get('[data-test="expense-view-receipts-action"]').should("be.visible").click();
        } else {
          cy.get('[data-test="expense-view-receipts-action"]').should("not.exist");
        }
      });
    });

    if (expenseData.receipts.length) {
      cy.get('[data-test="receipts-carousel"]')
        .should("be.visible")
        .within(() => {
          cy.get('[data-test="dummy-item"').should("not.exist");
          cy.get('[data-test="carousel-item"]').should("have.length", expenseData.receipts.length);

          if (expenseData.receipts.length > 1) {
            cy.get(".slider-navigation-next").should("be.visible");
            cy.get(".slider-pagination")
              .should("be.visible")
              .find(".slider-page")
              .should("have.length", expenseData.receipts.length)
              .filter(".is-active")
              .should("be.visible");
          } else {
            cy.get(".slider-pagination").should("exist").find(".slider-page").should("have.length", 0);
            cy.get(".slider-navigation-next").should("not.be.visible");
          }

          for (let ind = 0; ind < expenseData.receipts.length; ind++) {
            validateCarouselItem(ind, "next", expenseData.receipts);
          }
          for (let ind = expenseData.receipts.length - 1; ind >= 0; ind--) {
            validateCarouselItem(ind, "previous", expenseData.receipts);
          }

          cy.get('[data-test="receipt-close-action"]').should("be.visible").click();
        });
    }
  });
};

const validateCarouselItem = (ind: number, direction: "next" | "previous", expenseReceipts: ReceiptDetailType[]) => {
  cy.get('[data-test="receipt-loading-wait"]').should("not.exist");

  const receipt = expenseReceipts[ind];
  cy.get(`[data-receipt-name="${receipt.name}"]`).should("be.visible");
  if (receipt.contentType === ReceiptContentType.PDF) {
    cy.get(`[data-receipt-type="${receipt.contentType}"]`).should("be.visible").should("have.attr", "data-test", "pdf").should("be.loaded");
  } else {
    cy.get(`[data-receipt-type="${receipt.contentType}"]`).should("be.visible").should("have.attr", "data-test", "image").should("be.loaded");
    cy.get('[data-test="image-zoomout"]').should("be.visible").click();
    cy.get('[data-test="image-zoomin"]').should("be.visible").click();
  }

  if (ind === 0) {
    cy.get(".slider-navigation-previous").should("not.be.visible");
  } else {
    cy.get(".slider-navigation-previous").should("be.visible");
    if (direction === "previous") {
      cy.get(".slider-navigation-previous").click();
    }
  }
  if (expenseReceipts.length - ind > 1) {
    cy.get(".slider-navigation-next").should("be.visible");
    if (direction === "next") {
      cy.get(".slider-navigation-next").click();
    }
  } else {
    cy.get(".slider-navigation-next").should("not.be.visible");
  }
};
