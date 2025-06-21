import { NavBarSelectors } from "../../support/resource-types";
import { verifyPublicLinks, verifySecuredLinks, verifySecuredLinksFunctional } from "../utils/auth-utils";
import { enterSignupDetails } from "./utils/signup-utils";

function runSignupTest(signupSelector: string, userRef: string) {
  // clearing cache data to force reload data through api
  cy.deleteIndexedDb();
  // wait for 5 sec to allow site to emit and clear
  cy.wait(5000);
  cy.visit("/");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
  cy.get(signupSelector).should("be.visible").click();
  cy.url().should("include", "/signup");
  enterSignupDetails(userRef);
  cy.get('[data-test="login-button"]').should("be.visible");
  cy.get('[data-test="signup-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  cy.get('[data-test="signup-error-message"]').should("not.exist");
  verifyPublicLinks(false);
  verifySecuredLinksFunctional();
}

describe("User Signup Success Flow", () => {
  context(
    "Verifies new user can successfully sign up and access secured features",
    { tags: ["signup", "regression", "positive", "signup-tc1"] },
    () => {
      afterEach(() => {
        cy.logoutFromNav();
      });

      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runSignupTest('[data-test="signup-button-home"]', "user2-success");
      });

      it("via large desktop", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runSignupTest(NavBarSelectors.SignupNavlink, "user1-success");
      });
    }
  );
});
