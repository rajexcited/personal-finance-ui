import { ExpenseBelongsTo } from "../../../support/api-resource-types";
import { dateFormatLabel, dateTimestampFormatApi, expenseDateFormatFixture, formatTimestamp, parseTimestamp } from "../../../support/date-utils";
import { ExpenseIncomeDetailType, getExpenseIncome } from "../../../support/fixture-utils/read-expense-income";
import { ExpensePurchaseDetailType, getExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";
import { UnSupportedError } from "../../../support/resource-types";

const SEC_60_IN_MILLIS = 60 * 1000;
const SEC_30_IN_MILLIS = 30 * 1000;

export type UnionExpenseDetailType = ExpensePurchaseDetailType | ExpenseIncomeDetailType;

export const getExpense = (belongsTo: ExpenseBelongsTo, ref: string): Cypress.Chainable<any> => {
  if (belongsTo === ExpenseBelongsTo.Purchase) {
    return getExpensePurchase(ref) as Cypress.Chainable<ExpensePurchaseDetailType>;
  }
  if (belongsTo === ExpenseBelongsTo.Income) {
    return getExpenseIncome(ref) as Cypress.Chainable<ExpenseIncomeDetailType>;
  }
  throw new UnSupportedError(belongsTo + " not configured in fixture");
};

export const getExpenseDateFormatLabel = (expenseData: UnionExpenseDetailType) => {
  let expenseDateFromData: string | null = null;
  if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
    expenseDateFromData = expenseData.purchaseDate;
  } else if (expenseData.belongsTo === ExpenseBelongsTo.Income) {
    expenseDateFromData = expenseData.incomeDate;
  }

  if (expenseDateFromData) {
    const dateInstance = parseTimestamp(expenseDateFromData, expenseDateFormatFixture);
    if (isNaN(dateInstance.getTime())) {
      throw new UnSupportedError(
        `date for ${expenseData.belongsTo} is not in expected format[${expenseDateFormatFixture}]. actual date[${expenseDateFromData}]`
      );
    }
    const dateLabel = formatTimestamp(dateInstance, dateFormatLabel);
    return dateLabel;
  }
  throw new UnSupportedError("date not available");
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
  if (expenseData.belongsTo === ExpenseBelongsTo.Purchase) {
    return expenseData.purchaseTypeName;
  }
  if (expenseData.belongsTo === ExpenseBelongsTo.Income) {
    return expenseData.incomeTypeName;
  }
};

export const getBelongsToLabel = (belongsTo: ExpenseBelongsTo) => {
  if (belongsTo === ExpenseBelongsTo.Purchase) {
    return "Purchase";
  }
  if (belongsTo === ExpenseBelongsTo.Income) {
    return "Income";
  }
  throw new UnSupportedError(belongsTo + " is not matched");
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

    cy.get('[data-test="expense-card"]')
      .find('[data-test="card-header"]')
      .filter(`[data-belongs-to="${belongsToLabel}"]`)
      .filter(`[data-expense-category="${expenseCategoryName}"]`)
      .filter(`[data-billname="${expenseData.billName}"]`)
      .filter(`[data-verified-date="${verifiedTimestamp}"]`)
      .filter(`[data-expense-date="${expenseDateLabel}"]`)
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
              { label: "Tags", outValue: expenseData.tags.join("") },
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
  return cy.get("@actionContainer");
};

export const validateExpenseTableRowOnLarge = (belongsTo: ExpenseBelongsTo, ref: string) => {
  cy.get('[data-test="expense-list-view"]').should("be.visible");
  cy.get('[data-test="expense-list-error-message"]').should("not.be.visible");
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

      getExpense(belongsTo, ref).then((data) => {
        const expenseData = data as UnionExpenseDetailType;
        const expenseDateLabel = getExpenseDateFormatLabel(expenseData);
        const expenseCategoryName = getExpenseCategoryName(expenseData);
        const belongsToLabel = getBelongsToLabel(expenseData.belongsTo);

        cy.get('tr[data-test="expense-row"]')
          .filter(`[data-belongs-to="${belongsToLabel}"]`)
          .filter(`[data-expense-category="${expenseCategoryName}"]`)
          .filter(`[data-billname="${expenseData.billName}"]`)
          .filter(`[data-expense-date="${expenseDateLabel}"]`)
          .filter(($ind, $tr) => {
            // if (!isUpdated) {
            //   console.log("skipping filter for updatedOn time");
            //   // skip the filter
            //   return true;
            // }
            const rowUpdatedOnTime = parseTimestamp($tr.getAttribute("data-updated-on") || "", dateTimestampFormatApi).getTime();
            console.log("filtering for updatedOn time", $tr.getAttribute("data-updated-on"), "rowUpdatedOnTime=", rowUpdatedOnTime);
            if (rowUpdatedOnTime > Date.now() - SEC_30_IN_MILLIS) {
              console.log("matching criteria");
              return true;
            }
            console.log("doesn't match criteria");
            return false;
          })
          .should("have.length.at.least", 1)
          .within(() => {
            const expenseDataList = [
              belongsToLabel,
              expenseDateLabel,
              expenseData.paymentAccountName,
              expenseData.billName,
              `$ ${expenseData.amount}`,
              expenseCategoryName
            ];
            const tags = expenseData.tags.join(",");
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
  return cy.get("@actionContainer");
};
