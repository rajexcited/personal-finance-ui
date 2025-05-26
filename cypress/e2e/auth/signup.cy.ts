const publicLinks = ["#signup-navlink", "#login-navlink"];
const securedLinks = ["#expenses-navlink", "#payment-accounts-navlink", "#settings-navlink", "#logout-navlink"];

function verifyLinks(links: string[], shouldExist: boolean) {
  links.forEach((selector) => {
    cy.get(selector).should(shouldExist ? "exist" : "not.exist");
  });
}

function verifySecuredLinksFunctional(openNavMenu: boolean) {
  const clickAndWait = (selector: string) => {
    if (openNavMenu) cy.openNavMenu();
    cy.get(selector).should("be.visible").click();
    cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  };
  clickAndWait("#expenses-navlink");
  clickAndWait("#payment-accounts-navlink");
  clickAndWait("#settings-navlink");
  if (openNavMenu) cy.openNavMenu();
  cy.get("#logout-navlink").should("be.visible");
}

function runSignupTest(openNavMenu: boolean, signupSelector: string, userRef: string) {
  // clearing cache data to force reload data through api
  cy.clearIndexedDB();
  cy.visit("/");
  verifyLinks(publicLinks, true);
  verifyLinks(securedLinks, false);

  cy.get(signupSelector).should("be.visible").click();
  cy.url().should("include", "/signup");
  cy.get("form").should("be.visible");
  cy.enterSignupDetails(userRef);
  cy.get('[data-test="signup-button"]').should("be.visible");
  cy.get('[data-test="login-button"]').should("be.visible");
  cy.get('[data-test="signup-button"]').click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  cy.get('[data-test="signup-error"]').should("not.exist");
  verifyLinks(publicLinks, false);
  verifySecuredLinksFunctional(openNavMenu);
}

describe("User Signup Flow", () => {
  context("Verifies new user can successfully sign up and access secured features", { tags: ["signup", "regression", "positive"] }, () => {
    it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
      cy.setViewport("pixel9-pro");
      runSignupTest(true, '[data-test="signup-button-home"]', "user2-success");
    });

    it("via large desktop", { tags: ["desktop"] }, () => {
      cy.setViewport("desktop");
      runSignupTest(false, "#signup-navlink", "user1-success");
    });
  });
});
