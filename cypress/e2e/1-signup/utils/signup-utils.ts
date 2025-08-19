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

export const createUser = (userRef: string) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return;
  }
  getUserDetails(userRef).then((userData) => {
    const apiBody = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailId: userData.emailId,
      password: btoa(userData.password),
      countryCode: userData.countryCode
    };
    console.log("api user data to signup: ", apiBody);
    cy.request({
      method: "POST",
      url: apiBaseUrl + "/user/signup",
      body: apiBody,
      failOnStatusCode: false
    }).then((response) => {
      console.log("response=", response);
      expect([201, 400]).to.contains(response.status);
      // logout if user is created
      const accessToken = response.headers["x-amzn-remapped-authorization"] as string | null;
      if (accessToken) {
        cy.request({
          method: "POST",
          url: apiBaseUrl + "/user/logout",
          headers: {
            Authorization: accessToken
          }
        });
      }
    });
  });
};
