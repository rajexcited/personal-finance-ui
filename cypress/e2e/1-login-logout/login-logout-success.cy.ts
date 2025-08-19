import { getUserDetails } from "../../support/fixture-utils/read-user";
import { DeviceModeType, NavBarSelectors } from "../../support/resource-types";
import { createUser } from "../1-signup/utils/signup-utils";
import { verifyPublicLinks, verifySecuredLinks, verifySecuredLinksFunctional } from "../utils/auth-utils";

function runLoginTests(userRef: string, deviceMode: DeviceModeType) {
  verifyPublicLinks(true);
  verifySecuredLinks(false);
  cy.clickNavLinkAndWait(NavBarSelectors.LoginNavlink);
  cy.url().should("include", "/login");
  getUserDetails(userRef).then((user) => {
    cy.get("form").should("be.visible");
    cy.get("#emailId").should("be.visible").type(user.emailId);
    cy.get("#password").should("be.visible").type(user.password);
  });
  if (deviceMode === "large") {
    cy.get('[data-test="signup-button"]').should("be.visible");
  } else {
    cy.get('[data-test="signup-button"]').should("not.be.visible");
  }
  cy.get('[data-test="login-button"]').should("be.visible").click();
  cy.waitForPageLoad();
  cy.get('[data-test="login-error-message"]').should("not.exist");
  verifyPublicLinks(false);
  verifySecuredLinksFunctional();
}

function runLogoutTest() {
  cy.clickNavLinkAndWait(NavBarSelectors.LogoutNavlink);
  cy.url().should("include", "/logout");
  cy.get('[data-test="expire-status-msg"]').should("be.visible").should("have.text", "You are logged out");
  cy.get('[data-test="logout-message"]').should("be.visible").should("contain.text", "You have been logged out. See you soon");
  verifyPublicLinks(true);
  verifySecuredLinks(false);
}

function runLoginLogoutTest(userRef: string, deviceMode: DeviceModeType) {
  createUser(userRef);
  runLoginTests(userRef, deviceMode);
  runLogoutTest();
  cy.wait(5000);
  runLoginTests(userRef, deviceMode);
}

describe("User Login Logout Success Flow", () => {
  context(
    "Verifies user can successfully login and logout",
    { tags: ["login", "logout", "regression", "positive", "login-tc1", "logout-tc1", "login-tc5"] },
    () => {
      afterEach(() => {
        cy.logoutFromNav();
      });

      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        cy.visit("/");
        // verify login button on home page is functioning
        cy.get('[data-test="login-button-home"]').should("be.visible").click();
        cy.url().should("include", "/login");
        cy.get("#brandfinance-navlink").should("be.visible").click();
        cy.url().should("not.include", "/login").should("include", "/");
        // run test using login nav link
        runLoginLogoutTest("user1-success", "small");
      });

      it("via large desktop", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        cy.visit("/");
        runLoginLogoutTest("user1-success", "large");
      });
    }
  );
});
