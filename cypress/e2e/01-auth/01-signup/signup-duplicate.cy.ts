import { EnvId, NavBarSelectors } from "../../../support/resource-types";
import { verifyPublicLinks, verifySecuredLinks } from "../auth-utils";
import { enterSignupDetails } from "./signup-utils";

function runSignupTest(signupSelector: string, userRef: string) {
  const envId = Cypress.env("ENV_ID");
  if (envId === EnvId.Local) {
    cy.log("cannot run test for " + envId);
    return;
  }
  cy.createUser(userRef);
  // clearing cache data to force reload data through api
  cy.clearIndexedDB();
  cy.visit("/");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
  cy.get(signupSelector).should("be.visible").click();
  cy.url().should("include", "/signup");
  enterSignupDetails(userRef);
  cy.get('[data-test="signup-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  cy.get('[data-test="signup-error"]').should("be.visible").should("have.text", "emailId - the user with emailId already exists");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
}

describe("User Signup - Duplicate Account Flow", () => {
  context(
    "Ensures a public user with an existing email ID cannot sign up, triggering an 'account already exists' error",
    { tags: ["signup", "regression", "negative", "signup-tc2"] },
    () => {
      it("Fails signup via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runSignupTest('[data-test="signup-button-home"]', "user3-duplicate");
      });

      it("Fails signup via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runSignupTest(NavBarSelectors.SignupNavlink, "user3-duplicate");
      });
    }
  );
});
