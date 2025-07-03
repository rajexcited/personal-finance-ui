import { dateFormatLabel, dateTimestampFormatApi, formatTimestamp, parseTimestamp, purchaseDateFormatFixture } from "../../../support/date-utils";
import { getExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";

const SEC_60_IN_MILLIS = 60 * 1000;
const SEC_30_IN_MILLIS = 30 * 1000;
export const belongsToLabel = "Purchase";

export const validatePurchaseCardOnSmall = (purchaseRef: string) => {
  cy.get('[data-test="expense-list-view"]').should("be.visible");
  cy.get('[data-test="expense-list-error-message"]').should("not.be.visible");
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, purchaseDateFormatFixture), dateFormatLabel);
    const verifiedTimestamp = purchaseData.verifiedTimestamp ? formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateFormatLabel) : "-";
    console.log(
      "validatePurchaseCardOnSmall",
      "data.date",
      purchaseData.purchaseDate,
      "date",
      purchaseDate,
      "label",
      belongsToLabel,
      "verifieddate",
      verifiedTimestamp
    );
    cy.get('[data-test="expense-card"]')
      .find('[data-test="card-header"]')
      .filter(`[data-belongs-to="${belongsToLabel}"]`)
      .filter(`[data-expense-category="${purchaseData.purchaseTypeName}"]`)
      .filter(`[data-billname="${purchaseData.billName}"]`)
      .filter(`[data-verified-date="${verifiedTimestamp}"]`)
      .filter(`[data-expense-date="${purchaseDate}"]`)
      .should("have.length", 1)
      .parents('[data-test="expense-card"]')
      .as("actionContainer")
      .within(() => {
        cy.get('[data-test="expense-update-action"]').should("be.visible");
        cy.get('[data-test="expense-remove-action"]').should("be.visible");
        if (purchaseData.receipts.length) {
          cy.get('[data-test="expense-view-receipts-action"]').should("be.visible");
        } else {
          cy.get('[data-test="expense-view-receipts-action"]').should("not.exist");
        }
        cy.get('[data-test="expense-add-refund-action"]').should("be.visible");
        cy.get(".card-content.is-active").should("not.be.visible");
        cy.get('[data-test="expense-expand-collapse-action"]').should("be.visible").click();
        cy.get(".card-content.is-active")
          .should("be.visible")
          .within(() => {
            const purchaseDataList = [
              { label: "Expense Belongs To", outValue: belongsToLabel },
              { label: "Bill Name", outValue: purchaseData.billName },
              { label: "Expense Date", outValue: purchaseDate },
              { label: "Expense Category", outValue: purchaseData.purchaseTypeName },
              { label: "Payment Account", outValue: purchaseData.paymentAccountName },
              { label: "", outValue: verifiedTimestamp === "-" ? "Purchase un-verified" : verifiedTimestamp },
              { label: "Tags", outValue: purchaseData.tags.join("") },
              { label: "Share with Persons", outValue: "-" },
              { label: "Description", outValue: purchaseData.description }
            ];
            cy.get(".column").each(($cel, ind) => {
              if (purchaseDataList[ind]?.label) {
                cy.wrap($cel.find(".label")).should("be.visible").should("contain.text", purchaseDataList[ind]?.label);
              }
              cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", purchaseDataList[ind]?.outValue);
            });
          });
      });
  });
  return cy.get("@actionContainer");
};

export const validatePurchaseTableRowOnLarge = (purchaseRef: string, isUpdated: boolean) => {
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

      getExpensePurchase(purchaseRef).then((purchaseData) => {
        const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, purchaseDateFormatFixture), dateFormatLabel);
        const verifiedTimestamp = formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateFormatLabel);
        const belongsTo = "Purchase";
        console.log("validatePurchaseTableRowOnLarge", "date", purchaseDate, "belongsto", belongsTo, "verifiedDate", verifiedTimestamp);
        cy.get('tr[data-test="expense-row"]')
          .filter(`[data-belongs-to="${belongsTo}"]`)
          .filter(`[data-expense-category="${purchaseData.purchaseTypeName}"]`)
          .filter(`[data-billname="${purchaseData.billName}"]`)
          .filter(`[data-expense-date="${purchaseDate}"]`)
          .filter(($ind, $tr) => {
            if (!isUpdated) {
              console.log("skipping filter for updatedOn time");
              // skip the filter
              return true;
            }
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
            const purchaseDataList = [
              belongsToLabel,
              purchaseDate,
              purchaseData.paymentAccountName,
              purchaseData.billName,
              `$ ${purchaseData.amount}`,
              purchaseData.purchaseTypeName
            ];
            const tags = purchaseData.tags.join(",");
            if (tags.length > 15) {
              purchaseDataList.push(tags.substring(0, 12) + "...");
            } else {
              purchaseDataList.push(tags);
            }
            cy.get("td").each(($td, ind) => {
              if (ind < purchaseDataList.length) {
                cy.wrap($td).should("be.visible").should("contain.text", purchaseDataList[ind]);
              }
            });
            cy.get("td")
              .last()
              .as("actionContainer")
              .should("be.visible")
              .within(() => {
                cy.get('[data-test="expense-update-action"]').should("be.visible");
                cy.get('[data-test="expense-remove-action"]').should("be.visible");
                if (purchaseData.receipts.length) {
                  cy.get('[data-test="expense-view-receipts-action"]').should("be.visible");
                } else {
                  cy.get('[data-test="expense-view-receipts-action"]').should("not.exist");
                }
                cy.get('[data-test="expense-add-refund-action"]').should("be.visible");
              });
          });
      });
    });
  return cy.get("@actionContainer");
};
