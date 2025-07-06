import { getUserDetails } from "../../../support/fixture-utils/read-user";

export const enterSignupDetails = (userRef: string) => {
  getUserDetails(userRef).then((user) => {
    cy.get("form").should("be.visible");
    // Verify input fields exist and Fill out the signup form
    cy.get("#firstName").should("be.visible").type(user.firstName);
    cy.get("#lastName").should("be.visible").type(user.lastName);
    cy.get("#emailId").should("be.visible").type(user.emailId);
    cy.get("#password").should("be.visible").type(user.password);
    cy.get("#passwordRepeat").should("be.visible").type(user.password);
    cy.get("#countryCode").should("be.visible");
    cy.validateDropdownSelectedItem({ dropdownSelectorId: "countryCode", selectedItemText: user.countryText, requiredError: false });
    // cy.log(`all inputs are visibles and entered details ${user}`);
    cy.log("all input fields are typed");
  });
};
