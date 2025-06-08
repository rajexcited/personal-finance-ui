/// <reference types="cypress" />

import { setCustomViewPortPreset } from "./change-view-port";
import { getUserDetails } from "./read-user";
import { NavBarSelectors } from "./resource-types";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

/**
 * for desktop,
 *  landscape orientation means large screen. selected as default
 *  portrait orientation means medium screen.
 *
 * for other types,
 *  portrait orientation is default.
 */
Cypress.Commands.add("setViewport", (device: CustomDevicePreset | Cypress.ViewportPreset, orientation?: Cypress.ViewportOrientation) => {
  let cyChain = setCustomViewPortPreset(device, orientation);
  if (!cyChain) {
    cyChain = cy.viewport(device as Cypress.ViewportPreset, orientation, { log: true });
  }
  return cyChain.then(() => {
    cy.log(`the config for viewportWidth [${Cypress.config("viewportWidth")}] and viewportHeight [${Cypress.config("viewportHeight")}]`);
  });
});

Cypress.Commands.add("openNavMenu", () => {
  cy.get(".navbar-burger").then(($el) => {
    if ($el.is(":visible")) {
      cy.wait(500);
    }
  });
  cy.get(".navbar-menu").then(($el) => {
    if ($el.is(":visible")) {
      cy.log("Navmenu is open and visible");
    } else {
      cy.log("Navmenu is not visible");
      cy.get(".navbar-burger").should("be.visible").click();
      cy.wait(500);
      cy.get(".navbar-menu").should("be.visible");
    }
  });
});

Cypress.Commands.add("clickNavLinkAndWait", (navSelector: NavBarSelectors, timeoutInSec?: number) => {
  cy.openNavMenu();
  cy.get(navSelector).should("be.visible").click();
  timeoutInSec = timeoutInSec || 60;
  cy.get('[data-test="loading-spinner"]', { timeout: timeoutInSec * 1000 }).should("not.be.visible");
});

Cypress.Commands.add("clearIndexedDB", () => {
  const dbNames = ["expenseDb", "mock-expenseDb"];
  cy.window().then((win) => {
    dbNames.forEach((db) => {
      win.indexedDB.deleteDatabase(db);
    });
  });
});

Cypress.Commands.add("createUser", (userRef: string) => {
  return getUserDetails(userRef).then((userData) => {
    const apiBody = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      emailId: userData.emailId,
      password: btoa(userData.password),
      countryCode: userData.countryCode
    };
    return cy
      .request({
        method: "POST",
        url: Cypress.env("API_BASE_URL") + "/user/signup",
        body: apiBody,
        failOnStatusCode: false
      })
      .then((response) => {
        return cy.wrap(() => userData);
      });
  });
});

Cypress.Commands.add("logoutFromNav", () => {
  cy.get(NavBarSelectors.LogoutNavlink).then(($el) => {
    if ($el.length) {
      cy.clickNavLinkAndWait(NavBarSelectors.LogoutNavlink);
    }
  });
  cy.get(NavBarSelectors.LogoutNavlink).should("not.exist");
  cy.get(NavBarSelectors.SignupNavlink).should("exist");
  cy.get(NavBarSelectors.LoginNavlink).should("exist");
});
