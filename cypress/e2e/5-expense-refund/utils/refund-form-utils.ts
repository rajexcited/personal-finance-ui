import { expenseDateFormatFixture, formatTimestamp, parseTimestamp, shortDateFormat } from "../../../support/date-utils";
import { ExpensePurchaseDetailType } from "../../../support/fixture-utils/read-expense-purchase";

export const validatePurchaseQuickView = (purchaseData: ExpensePurchaseDetailType | undefined) => {
  if (!purchaseData) {
    cy.get('section[data-test="view-dialog"][data-dialog-id="purchase-quickview"]')
      .should("exist")
      .find('[data-test="open-dialog-action"]')
      .should("not.be.visible");
  } else {
    cy.get('section[data-test="view-dialog"][data-dialog-id="purchase-quickview"]')
      .should("be.visible")
      .within(() => {
        cy.get('[data-test="open-dialog-action"]').should("be.visible").click();

        const purchaseQuickviewBlocks = [
          { label: "BillName", outValue: purchaseData.billName },
          { label: "Amount", outValue: purchaseData.amount },
          { label: "Payment Account", outValue: purchaseData.paymentAccountName },
          { label: "Tag Persons", outValue: "-" }
        ];
        cy.get(".block").each(($cel, ind) => {
          cy.wrap($cel.find("label")).should("be.visible").should("contain.text", purchaseQuickviewBlocks[ind].label);
          cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", purchaseQuickviewBlocks[ind].outValue);
        });

        cy.get('[data-test="close-dialog-action"]').should("be.visible").click();
      });
  }
};

const getPurchaseText = (purchaseData: ExpensePurchaseDetailType) => {
  const purchaseDate = formatTimestamp(parseTimestamp(purchaseData.purchaseDate, expenseDateFormatFixture), shortDateFormat);
  const selectedPurchaseText = `Billname: ${purchaseData.billName}; Amount: ${purchaseData.amount}; Purchase Date: ${purchaseDate}`;
  return selectedPurchaseText;
};

export const validateSelectedPurchaseDropdown = (purchaseData: ExpensePurchaseDetailType | undefined) => {
  if (purchaseData) {
    cy.validateDropdownSelectedItem({ dropdownSelectorId: "purchase-dd", requiredError: false, selectedItemText: getPurchaseText(purchaseData) });
  } else {
    cy.validateDropdownSelectedItem({ dropdownSelectorId: "purchase-dd", requiredError: false });
  }
};

export const validatePurchaseInfo = (purchaseData: ExpensePurchaseDetailType | undefined) => {
  if (purchaseData) {
    cy.get('[data-test="selected-purchase-billname-info"]').should("be.visible").should("contain.text", purchaseData.billName);
    cy.get('[data-test="selected-purchase-amount-info"]').should("be.visible").should("contain.text", purchaseData.amount);
    cy.get('[data-test="selected-purchase-payment-account-info"]').should("be.visible").should("contain.text", purchaseData.paymentAccountName);
    cy.get('[data-test="selected-purchase-share-person-info"]').should("be.visible");
    cy.get('[data-test="selected-purchase-tags-info"]')
      .should("be.visible")
      .should("contain.text", "tags will auto apply in dashboard total. No need to add same tags here");
  } else {
    cy.get('[data-test="selected-purchase-billname-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-amount-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-payment-account-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-share-person-info"]').should("not.be.visible");
    cy.get('[data-test="selected-purchase-tags-info"]').should("not.be.visible");
  }
};

const loadMoreItemsInDropdown = (itemText: string, remainingRetries: number): Cypress.Chainable<number> => {
  if (remainingRetries < 0) {
    return cy.wrap(0);
  }
  return (
    cy
      .wait(1000)
      // .pause()
      .get(".dropdown-menu")
      .should("be.visible")
      .then(($menu) => {
        const $list = $menu.find(".dropdown-item");
        const filtered = $list.filter(':contains("' + itemText + '")');
        cy.log(`found ${filtered.length} dropdown items, remaining retries: ${remainingRetries}`);
        if (filtered.length) {
          return cy.wrap(filtered.length);
        }
        cy.get('[data-test="load-more-action"]').should("be.visible").click();
        cy.get('[data-test="load-more-action"]').should("not.be.visible");
        cy.get('button[data-test="toggle-dropdown-action"]').click();
        cy.get('[data-test="dropdown-item-wait"]').should("not.exist");
        return loadMoreItemsInDropdown(itemText, remainingRetries - 1);
      })
  );
};

export const selectPurchase = (options: { existingPurchaseData?: ExpensePurchaseDetailType; newPurchaseData?: ExpensePurchaseDetailType }) => {
  validatePurchaseQuickView(options.existingPurchaseData);
  validateSelectedPurchaseDropdown(options.existingPurchaseData);
  validatePurchaseInfo(options.existingPurchaseData);

  const newPurchaseData = options.newPurchaseData;
  if (newPurchaseData && options.existingPurchaseData?.ref !== newPurchaseData.ref) {
    const dropdownSelectorId = "purchase-dd";
    cy
      // .pause()
      .wait(1000)
      .get(`[data-test="dropdown-field"][data-dropdown-id="${dropdownSelectorId}"]`)
      .should("be.visible")
      .within(() => {
        cy.get('button[data-test="toggle-dropdown-action"]').click();
        cy.get('[data-test="load-more-action"]').should("be.visible").click();
        cy.get('[data-test="load-more-action"]').should("not.be.visible");
        cy.get('button[data-test="toggle-dropdown-action"]').click();
        cy.get('[data-test="dropdown-item-wait"]').should("not.exist");
        cy.get(`#${dropdownSelectorId}search-items`).should("be.visible").should("be.enabled").type(newPurchaseData.amount);
        loadMoreItemsInDropdown(getPurchaseText(newPurchaseData), 2);
        // cy.pause();
        // cy.get(".dropdown-menu")
        //   .should("be.visible")
        //   .find(".dropdown-item")
        //   .then(($list) => {
        //     const filtered = $list.filter(':contains("' + getPurchaseText(newPurchaseData) + '")');
        //     cy.pause();
        //     if (!filtered.length) {
        //       cy.get('[data-test="load-more-action"]').should("be.visible").click().should("not.be.visible");
        //       cy.get('button[data-test="toggle-dropdown-action"]').click();
        //       cy.get('[data-test="dropdown-item-wait"]').should("not.exist");
        //     }
        //   });

        cy.get(".dropdown-menu")
          .should("be.visible")
          .find(".dropdown-item")
          .then(($list) => {
            const filtered = $list.filter(':contains("' + getPurchaseText(newPurchaseData) + '")');
            expect(filtered.length).be.greaterThan(0);
            cy.wrap(filtered).first().click();
          });
      });

    validatePurchaseQuickView(options.newPurchaseData);
    validateSelectedPurchaseDropdown(options.newPurchaseData);
    validatePurchaseInfo(options.newPurchaseData);
  }
};
