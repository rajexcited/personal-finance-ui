import { getUserDetails } from "../../support/fixture-utils/read-user";
import { NavBarSelectors } from "../../support/resource-types";
import { createUser } from "../1-signup/utils/signup-utils";
import { verifyPublicLinks, verifySecuredLinks } from "../utils/auth-utils";

function runLoginTest(userRef: string, errorField: "emailId" | "password") {
  createUser(userRef);

  cy.visit("/");
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
  cy.waitForPageLoad();
  cy.get('[data-test="login-error-message"]').should("be.visible").should("have.text", "emailId or password invalid");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
}

describe("User Login - Denied Flow", () => {
  context(
    "Ensures a user tries to login with incorrect password and gets access denied error",
    { tags: ["login", "regression", "negative", "login-tc3"] },
    () => {
      it("Fails login via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runLoginTest("user3-duplicate", "password");
      });

      it("Fails login via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runLoginTest("user3-duplicate", "password");
      });
    }
  );
  context(
    "Ensures a user tries to login with incorrect emailId and gets access denied error",
    { tags: ["login", "regression", "negative", "login-tc3"] },
    () => {
      it("Fails login via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runLoginTest("user3-duplicate", "emailId");
      });

      it("Fails login via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runLoginTest("user3-duplicate", "emailId");
      });
    }
  );
});
