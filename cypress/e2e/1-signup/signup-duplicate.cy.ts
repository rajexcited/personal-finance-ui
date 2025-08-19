import { NavBarSelectors } from "../../support/resource-types";
import { verifyPublicLinks, verifySecuredLinks } from "../utils/auth-utils";
import { createUser, enterSignupDetails } from "./utils/signup-utils";

function runSignupTest(signupSelector: string, userRef: string) {
  createUser(userRef);
  // clearing cache data to force reload data through api
  cy.deleteIndexedDb();
  cy.visit("/");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
  cy.get(signupSelector).should("be.visible").click();
  cy.url().should("include", "/signup");
  enterSignupDetails(userRef);
  cy.get('[data-test="signup-button"]').should("be.visible").click();
  cy.waitForPageLoad();
  cy.get('[data-test="signup-error-message"]').should("be.visible").should("have.text", "emailId - the user with emailId already exists");
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
