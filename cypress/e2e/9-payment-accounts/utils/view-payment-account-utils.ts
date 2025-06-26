import { getPaymentAccount, PaymentAccountDetailType } from "../../../support/fixture-utils/read-payment-account";

export const validateViewCardDetails = (paymentAccountData: PaymentAccountDetailType) => {
  const paymentAccountDataList = [
    { label: "Account Name / Number", outValue: paymentAccountData.accountName },
    { label: "Institution Name", outValue: paymentAccountData.institutionName },
    { label: "Account Type", outValue: paymentAccountData.accountTypeName },
    { label: "Tags", outValue: paymentAccountData.tags.join("") },
    {},
    { label: "Description", outValue: paymentAccountData.description }
  ];
  cy.get(".card-content.is-active")
    .should("be.visible")
    .find(".column")
    .each(($cel, ind) => {
      // console.log("each column text = ", $cel.text(), " and size=", $cel.text().length);
      if ($cel.text().trim().length) {
        cy.wrap($cel.find(".label")).should("contain.text", paymentAccountDataList[ind]?.label);
        cy.wrap($cel.find('[data-test="outvalue"]')).should("have.text", paymentAccountDataList[ind]?.outValue);
      }
    });
};

export const getPaymentAccountCard = ($cardElementList: JQuery<HTMLElement>, shortName: string) => {
  const filteredElement = $cardElementList.filter(
    (_, el) => (el.querySelector(".card-header-title") as HTMLElement | null)?.innerText.trim() === shortName
  );
  expect(filteredElement.length).to.equal(1);
  cy.wrap(filteredElement).should("be.visible");
  return cy.wrap(filteredElement);
};

export const validateCard = (paymentAccountRef: string, $cardElementList: JQuery<HTMLElement>, isDeletable: boolean) => {
  getPaymentAccount(paymentAccountRef).then((paymentAccountData) => {
    getPaymentAccountCard($cardElementList, paymentAccountData.shortName).then((filteredElement) => {
      cy.wrap(filteredElement).within(() => {
        cy.get('[data-test="card-header-action-update"]').should("be.visible");
        console.log(paymentAccountRef, isDeletable);
        if (isDeletable) {
          cy.get('[data-test="card-header-action-delete"]').should("be.visible");
        } else {
          cy.get('[data-test="card-header-action-delete"]').should("not.exist");
        }

        cy.get(".card-content.is-active").should("exist").should("not.be.visible");
        cy.get('[data-test="card-header-action-expand-collapse"]').should("be.visible").click();
        validateViewCardDetails(paymentAccountData);
        cy.get('[data-test="card-header-action-expand-collapse"]').should("be.visible").click();
        cy.get(".card-content.is-active").should("not.exist");
      });
    });
  });
};
