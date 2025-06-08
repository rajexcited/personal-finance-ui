import { getUserDetails } from "../../../support/read-user";
import { EnvId, NavBarSelectors } from "../../../support/resource-types";
import { verifyPublicLinks, verifySecuredLinks } from "../auth-utils";

function runLoginTest(userRef: string, errorField: "emailId" | "password") {
  const envId = Cypress.env("ENV_ID");
  if (envId === EnvId.Local) {
    cy.log("cannot run test for " + envId);
    return;
  }
  verifyPublicLinks(true);
  verifySecuredLinks(false);
  cy.clickNavLinkAndWait(NavBarSelectors.LoginNavlink);
  cy.url().should("include", "/login");
  getUserDetails(userRef).then((user) => {
    cy.get("form").should("be.visible");
    const emailPrefix = errorField === "emailId" ? "wrong" : "";
    cy.get("#emailId")
      .should("be.visible")
      .type(emailPrefix + user.emailId);
    const passwordSuffix = errorField === "password" ? "wrong" : "";
    cy.get("#password")
      .should("be.visible")
      .type(user.password + passwordSuffix);
  });
  cy.get('[data-test="login-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  cy.get('[data-test="login-error"]').should("be.visible").should("have.text", "emailId or password invalid");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
}

describe("User Login - Denied Flow", () => {
  context("Ensures a user tries to login with incorrect password and gets access denied error", { tags: ["login", "negative", "login-tc3"] }, () => {
    it("Fails login via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
      cy.setViewport("pixel9-pro");
      runLoginTest("user1-success", "password");
    });

    it("Fails login via large desktop view", { tags: ["desktop"] }, () => {
      cy.setViewport("desktop");
      runLoginTest("user1-success", "password");
    });
  });
  context("Ensures a user tries to login with incorrect emailId and gets access denied error", { tags: ["login", "negative", "login-tc3"] }, () => {
    it("Fails login via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
      cy.setViewport("pixel9-pro");
      runLoginTest("user1-success", "emailId");
    });

    it("Fails login via large desktop view", { tags: ["desktop"] }, () => {
      cy.setViewport("desktop");
      runLoginTest("user1-success", "emailId");
    });
  });
});
