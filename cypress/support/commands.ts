/// <reference types="cypress" />
/// <reference types="../plugins/indexedDb/indexeddb-commands.d.ts" />

import { ApiCurrencyProfileResource } from "./api-resource-types";
import { setCustomViewPortPreset } from "./change-view-port";
import { getUserDetails } from "./read-user";
import { NavBarSelectors } from "./resource-types";
import "../plugins/indexedDb";
import { IndexedDbName } from "../plugins/indexedDb/resource";

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

Cypress.Commands.add("loginThroughUI", (userRef) => {
  cy.visit("/");
  cy.get(NavBarSelectors.SignupNavlink).should("exist");
  cy.get(NavBarSelectors.LoginNavlink).should("exist");
  cy.get(NavBarSelectors.LogoutNavlink).should("not.exist");
  cy.clickNavLinkAndWait(NavBarSelectors.LoginNavlink);
  cy.url().should("include", "/login");

  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    cy.intercept("POST", apiBaseUrl + "/user/login", (req) => {
      req.continue((res) => {
        const accessToken = res.headers["x-amzn-remapped-Authorization"] as string | null;
        Cypress.env("accessToken", accessToken);
      });
    });
  }

  getUserDetails(userRef).then((user) => {
    cy.get("form").should("be.visible");
    cy.get("#emailId").should("be.visible").type(user.emailId);
    cy.get("#password").should("be.visible").type(user.password);
  });
  cy.get('[data-test="login-button"]').should("be.visible").click();
  cy.get('[data-test="loading-spinner"]').should("be.visible");
  cy.get('[data-test="loading-spinner"]', { timeout: 60000 }).should("not.be.visible");
  cy.get('[data-test="login-error-message"]').should("not.exist");
  cy.get(NavBarSelectors.LoginNavlink).should("not.exist");
  cy.get(NavBarSelectors.LogoutNavlink).should("exist");
});

Cypress.Commands.add("getCurrencyProfile", () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    return cy
      .request({
        method: "GET",
        url: apiBaseUrl,
        headers: {
          Authorization: Cypress.env("accessToken")
        }
      })
      .then((response) => {
        return response.body as ApiCurrencyProfileResource;
      });
  }
  // read from mock db
  return cy
    .indexedDb(IndexedDbName.MockExpense)
    .getItem<ApiCurrencyProfileResource>("currency-profile", { storeName: "config-store", indexName: "belongsTo-index" })
    .then((results) => {
      // console.log("results", results);
      return results;
    });
});

type SelectDropdownItemOptions = { dropdownSelectorId: string; selectNewItemText: string; selectedItemText?: string };
Cypress.Commands.add("selectDropdownItem", (options: SelectDropdownItemOptions) => {
  cy.get(`#${options.dropdownSelectorId} .dropdown-menu`).should("not.be.visible");
  const selectedItemText = options.selectedItemText ? options.selectedItemText : "Select";
  cy.get(`#${options.dropdownSelectorId} button`)
    .should("be.visible")
    .invoke("text")
    .then((text) => {
      expect(text.trim()).to.equal(selectedItemText);
      expect(text.trim()).not.to.equal(options.selectNewItemText);
    });
  cy.get(`#${options.dropdownSelectorId} button`).click();
  cy.get(`#${options.dropdownSelectorId} .dropdown-menu`)
    .should("be.visible")
    .find(".dropdown-item")
    .filter(':contains("' + options.selectNewItemText + '")')
    .should("have.length", 1)
    .should("be.visible")
    .click();
  cy.get(`#${options.dropdownSelectorId} .dropdown-menu`).should("not.be.visible");
  cy.get(`#${options.dropdownSelectorId} button`)
    .should("be.visible")
    .invoke("text")
    .then((text) => {
      expect(text.trim()).not.to.equal(selectedItemText);
      expect(text.trim()).to.equal(options.selectNewItemText);
    });
});

type SelectTagsOptions = { tagsSelectorId: string; addTagValues: string[]; existingTagValues: string[]; removeTagValues: string[] };
Cypress.Commands.add("selectTags", (options: SelectTagsOptions) => {
  cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
    .find(".dropdown-menu")
    .should("not.be.visible");

  cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
    .find(".tags-input")
    .find("span.tag[data-value]")
    .should("have.length", options.existingTagValues.length);

  cy.get('[data-test="' + options.tagsSelectorId + '-tags-counter"]')
    .should("be.visible")
    .should("have.text", `counter: ${options.existingTagValues.length}/10`);

  for (let tagValue of options.removeTagValues) {
    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .find(".tags-input")
      .find("span.tag[data-value]")
      .filter('[data-value="' + tagValue + '"]')
      .should("be.visible")
      .find('.delete[data-tag="delete"]')
      .should("be.visible")
      .click();

    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .find(".tags-input")
      .find("span.tag[data-value]")
      .filter('[data-value="' + tagValue + '"]')
      .should("not.exist");
  }

  const existingTagValuesAfterRemoved = options.existingTagValues.filter((tv) => !options.removeTagValues.includes(tv));
  const addTagValues = options.addTagValues.filter((tv) => !existingTagValuesAfterRemoved.includes(tv));

  for (let tagValue of addTagValues) {
    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .find(".tags-input")
      .find("span.tag[data-value]")
      .filter('span[data-value="' + tagValue + '"]')
      .should("not.exist");

    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .should("be.visible")
      .find(".tags-input")
      .should("be.visible")
      .find("input.input")
      .should("have.length", 1)
      .should("be.visible")
      .type(tagValue);

    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .find(".dropdown-menu")
      .should("be.visible")
      .find(".dropdown-item")
      .should("have.length.at.least", 1)
      .then(($items) => {
        const $filtered = $items.filter((i, el) => el.textContent === tagValue);
        if ($filtered.length === 0) {
          cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
            .find(".tags-input")
            .find("input.input")
            .type("{enter}");
        } else {
          expect($filtered.length).to.equal(1);
          cy.wrap($filtered).should("be.visible").click();
        }
      });
  }

  cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
    .find(".dropdown-menu")
    .should("not.be.visible");

  const tagValues = [...addTagValues, ...existingTagValuesAfterRemoved];

  cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
    .find(".tags-input")
    .find("span.tag[data-value]")
    .should("have.length", tagValues.length);
  cy.get('[data-test="' + options.tagsSelectorId + '-tags-counter"]')
    .should("be.visible")
    .should("have.text", `counter: ${tagValues.length}/10`);

  for (let tagValue of tagValues) {
    cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
      .find(".tags-input")
      .find("span[data-value]")
      .filter('span[data-value="' + tagValue + '"]')
      .should("be.visible");
  }
});

Cypress.Commands.add("verifyCurrencySection", () => {
  cy.get("section.currency-symbol-section").should("be.visible");
  cy.indexedDb(IndexedDbName.Expense)
    .getItem<ApiCurrencyProfileResource>("currency-profile", { storeName: "config-store", indexName: "belongsTo-index" })
    .then((currencyProfile) => {
      console.log(currencyProfile);
      expect(currencyProfile).to.be.exist;
      cy.get(".country-field").find("span.tag").should("be.visible").should("have.text", currencyProfile?.country.code);
      cy.get(".currency-field").find("span.tag").should("be.visible").should("have.text", currencyProfile?.currency.code);
    });
});
