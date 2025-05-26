/// <reference types="cypress" />

import { setCustomViewPortPreset } from "./change-view-port";
import { getUserDetails } from "./read-user";

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
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

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

Cypress.Commands.add("enterSignupDetails", (userRef: string) => {
  return getUserDetails(userRef).then((user) => {
    // Verify input fields exist
    cy.get("#firstName").should("be.visible");
    cy.get("#lastName").should("be.visible");
    cy.get("#emailId").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("#passwordRepeat").should("be.visible");
    cy.get("#countryCode").should("be.visible");
    cy.log(`all inputs are visibles. not entering details ${user}`);
    // Fill out the signup form
    let uiVersion: string | null = Cypress.env("uiVersion");
    cy.get("#firstName").type(user.firstName);
    if (uiVersion) {
      cy.get("#firstName").type(" " + uiVersion);
      cy.get("#emailId").type(uiVersion);
    }
    cy.get("#lastName").type(user.lastName);
    cy.get("#emailId").type(user.emailId);
    cy.get("#password").type(user.password);
    cy.get("#passwordRepeat").type(user.password);
    cy.get("#countryCode button").should("have.text", user.countryText);
    cy.log("all input fields are typed");
  });
});

Cypress.Commands.add("openNavMenu", () => {
  cy.get(".navbar-menu").then(($el) => {
    if ($el.is(":visible")) {
      cy.log("Navmenu is open and visible");
    } else {
      cy.log("Navmenu is not visible");
      cy.get(".navbar-burger").click();
    }
  });
});

Cypress.Commands.add("clearIndexedDB", () => {
  const dbNames = ["expenseDb", "mock-expenseDb"];
  cy.window().then((win) => {
    dbNames.forEach((db) => {
      win.indexedDB.deleteDatabase(db);
    });
  });
});
