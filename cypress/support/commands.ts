/// <reference types="cypress" />
/// <reference types="../plugins/indexedDb/indexeddb-commands.d.ts" />

import { ApiCurrencyProfileResource } from "./api-resource-types";
import { setCustomViewPortPreset } from "./change-view-port";
import { getUserDetails } from "./fixture-utils/read-user";
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

Cypress.Commands.add("waitForPageLoad", (waitOnSec?: number) => {
  const timeoutInSec = waitOnSec || 60;
  // console.log(new Date(), "LoadSpinner", timeoutInSec, "sec wait for page route");
  cy.get('[data-test="loading-spinner"]', { timeout: timeoutInSec * 1000 }).should("not.be.visible");
  cy.get('[data-loading-spinner-id="page-route"]', { timeout: timeoutInSec * 1000 }).should("not.be.visible");
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
  cy.waitForPageLoad(timeoutInSec);
});

Cypress.Commands.add("logoutFromNav", () => {
  cy.get(NavBarSelectors.LogoutNavlink).then(($el) => {
    // console.log(new Date(), "LoadSpinner logout link clicking from nav");
    if ($el.length) {
      cy.clickNavLinkAndWait(NavBarSelectors.LogoutNavlink);
    }
  });
  cy.get(NavBarSelectors.LogoutNavlink).should("not.exist");
  cy.get(NavBarSelectors.SignupNavlink).should("exist");
  cy.get(NavBarSelectors.LoginNavlink).should("exist");
  cy.get('[data-test="logout-message"]').should("be.visible").should("contain.text", "You have been logged out. See you soon");
  cy.get('[data-test="expire-status-msg"]').should("be.visible").should("have.text", "You are logged out");
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
        // console.log("response: ", res);
        // console.log("response headers: ", res.headers);
        // console.log("response body: ", res.body);
        const accessToken = res.headers["x-amzn-remapped-authorization"] as string | null;
        console.log("accessToken=", accessToken);
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
  cy.waitForPageLoad();
  cy.get('[data-test="login-error-message"]').should("not.exist");
  cy.get(NavBarSelectors.LoginNavlink).should("not.exist");
  cy.get(NavBarSelectors.LogoutNavlink).should("exist");
});

Cypress.Commands.add("getCurrencyProfile", () => {
  return cy.wrap((Cypress as any).state("aliases")["currency-profile-config-data"] || null).then((data: any) => {
    // cy.get("@currency-profile-config-data").then((data: any) => {
    if (data) {
      return data as ApiCurrencyProfileResource;
    }

    return cy
      .indexedDb(IndexedDbName.Expense)
      .getItem<ApiCurrencyProfileResource>("currency-profile", { storeName: "config-store", indexName: "belongsTo-index" })
      .then((results) => {
        if (results) {
          return results;
        }
        const apiBaseUrl = Cypress.env("API_BASE_URL");
        if (apiBaseUrl) {
          return cy
            .request({
              method: "GET",
              url: `${apiBaseUrl}/config/types/belongs-to/currency-profile?status=enable`,
              headers: {
                Authorization: Cypress.env("accessToken")
              }
            })
            .then((response) => {
              expect(response.status).to.equals(200);
              expect(response.body).to.be.an("array");
              expect(response.body.length).to.least(1);
              const currencyProfile = response.body[0] as ApiCurrencyProfileResource;
              return cy.wrap(currencyProfile).as("currency-profile-config-data");
            });
        }
        // read from mock db
        return cy
          .indexedDb(IndexedDbName.MockExpense)
          .getItem<ApiCurrencyProfileResource>("currency-profile", { storeName: "config-store", indexName: "belongsTo-index" })
          .then((results) => {
            // console.log("results", results);
            if (results) return results;
            throw new Error("currency profile from mockDb not found");
          });
      });
  });
});

type ValidateDropdownSelectedItemOptions = { dropdownSelectorId: string; selectedItemText?: string; requiredError: boolean };
Cypress.Commands.add("validateDropdownSelectedItem", (options: ValidateDropdownSelectedItemOptions) => {
  cy.get(`[data-test="dropdown-field"][data-dropdown-id="${options.dropdownSelectorId}"]`)
    .should("be.visible")
    .within(() => {
      cy.get(".dropdown-menu").should("not.be.visible");
      const selectedItemText = options.selectedItemText ? options.selectedItemText : "Select";
      cy.get('button[data-test="toggle-dropdown-action"]')
        .should("be.visible")
        .invoke("text")
        .then((text) => {
          expect(text.trim()).to.equal(selectedItemText);
        });

      if (options.requiredError && !options.selectedItemText) {
        cy.get('[data-test="dropdown-error"]').should("be.visible").should("contain.text", "Please select an item from dropdown.");
      } else {
        cy.get('[data-test="dropdown-error"]').should("not.exist");
      }
    });
});

type SelectDropdownItemOptions = ValidateDropdownSelectedItemOptions & { selectNewItemText: string };
Cypress.Commands.add("selectDropdownItem", (options: SelectDropdownItemOptions) => {
  cy.get(`[data-test="dropdown-field"][data-dropdown-id="${options.dropdownSelectorId}"]`)
    .should("be.visible")
    .within(() => {
      cy.get(".dropdown-menu").should("not.be.visible");
      const selectedItemText = options.selectedItemText ? options.selectedItemText : "Select";
      cy.get('button[data-test="toggle-dropdown-action"]')
        .should("be.visible")
        .invoke("text")
        .then((text) => {
          expect(text.trim()).to.equal(selectedItemText);
          expect(text.trim()).not.to.equal(options.selectNewItemText);
        });

      if (options.requiredError && !options.selectedItemText) {
        cy.get('[data-test="dropdown-error"]').should("be.visible").should("contain.text", "Please select an item from dropdown.");
      } else {
        cy.get('[data-test="dropdown-error"]').should("not.exist");
      }

      cy.get('button[data-test="toggle-dropdown-action"]').click();
      cy.get(".dropdown-menu")
        .should("be.visible")
        .find(".dropdown-item")
        .filter(':contains("' + options.selectNewItemText + '")')
        .should("have.length", 1)
        .should("be.visible")
        .click();
      cy.get(".dropdown-menu").should("not.be.visible");
      cy.get('button[data-test="toggle-dropdown-action"]')
        .should("be.visible")
        .invoke("text")
        .then((text) => {
          expect(text.trim()).not.to.equal(selectedItemText);
          expect(text.trim()).to.equal(options.selectNewItemText);
        });
    });
});

type SelectTagsOptions = { tagsSelectorId: string; addTagValues: string[]; existingTagValues: string[]; removeTagValues: string[] };
Cypress.Commands.add("selectTags", (options: SelectTagsOptions) => {
  cy.get('[data-test="tags-field"][data-id="' + options.tagsSelectorId + '"]')
    .should("be.visible")
    .within(() => {
      cy.get(".dropdown-menu").should("not.be.visible");
      cy.get(".tags-input").should("be.visible").find("span.tag[data-value]").should("have.length", options.existingTagValues.length);

      cy.get('[data-test="' + options.tagsSelectorId + '-tags-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${options.existingTagValues.length}/10`);

      const removeTagValues = [
        ...new Set(options.removeTagValues.concat(options.existingTagValues.filter((tv) => !options.addTagValues.includes(tv))))
      ];
      cy.get(".tags-input").within(() => {
        for (let tagValue of removeTagValues) {
          cy.get('[data-value="' + tagValue + '"]')
            .should("be.visible")
            .find('.delete[data-tag="delete"]')
            .should("be.visible")
            .click()
            .should("not.exist");
        }
      });

      const existingTagValuesAfterRemoved = options.existingTagValues.filter((tv) => !removeTagValues.includes(tv));
      const addTagValues = options.addTagValues.filter((tv) => !existingTagValuesAfterRemoved.includes(tv));

      for (let tagValue of addTagValues) {
        cy.get(".tags-input")
          .find('span[data-value="' + tagValue + '"]')
          .should("not.exist");

        cy.get(".tags-input").find("input.input").should("have.length", 1).should("be.visible").type(tagValue);

        cy.get(".dropdown-menu")
          .should("be.visible")
          .find(".dropdown-item")
          .should("have.length.at.least", 1)
          .then(($items) => {
            const $filtered = $items.filter((i, el) => el.textContent === tagValue);
            if ($filtered.length === 0) {
              cy.get(".tags-input").find("input.input").type("{enter}");
            } else {
              expect($filtered.length).to.equal(1);
              cy.wrap($filtered).should("be.visible").click();
            }
          });
      }

      cy.get(".dropdown-menu").should("not.be.visible");

      const tagValues = [...addTagValues, ...existingTagValuesAfterRemoved];

      cy.get(".tags-input").find("span.tag[data-value]").should("have.length", tagValues.length);
      cy.get('[data-test="' + options.tagsSelectorId + '-tags-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${tagValues.length}/10`);

      cy.get(".tags-input").within(() => {
        for (let tagValue of tagValues) {
          cy.get('span[data-value="' + tagValue + '"]').should("be.visible");
        }
      });
    });
});

type SelectSharePersonTagsOptions = { selectorId: string; addValues: string[]; existingValues: string[]; removeValues: string[] };
Cypress.Commands.add("selectSharePersonTags", (options: SelectSharePersonTagsOptions) => {
  cy.get('[data-test="tags-share-person-field"][data-id="' + options.selectorId + '"]')
    .should("be.visible")
    .within(() => {
      cy.get(".dropdown-menu").should("not.be.visible");
      cy.get(".tags-input").should("be.visible").find("span.tag[data-value]").should("have.length", options.existingValues.length);

      cy.get('[data-test="' + options.selectorId + '-tags-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${options.existingValues.length}/10`);

      cy.get(".tags-input").within(() => {
        for (let tagValue of options.removeValues) {
          cy.get('[data-value="' + tagValue + '"]')
            .should("be.visible")
            .find('.delete[data-tag="delete"]')
            .should("be.visible")
            .click()
            .should("not.exist");
        }
      });

      const existingTagValuesAfterRemoved = options.existingValues.filter((tv) => !options.removeValues.includes(tv));
      const addTagValues = options.addValues.filter((tv) => !existingTagValuesAfterRemoved.includes(tv));

      for (let tagValue of addTagValues) {
        cy.get(".tags-input")
          .find('span[data-value="' + tagValue + '"]')
          .should("not.exist");

        cy.get(".tags-input").find("input.input").should("have.length", 1).should("be.visible").type(tagValue);

        cy.get(".dropdown-menu")
          .should("be.visible")
          .find(".dropdown-item")
          .should("have.length.at.least", 1)
          .then(($items) => {
            const $filtered = $items.filter((i, el) => el.textContent === tagValue);
            if ($filtered.length === 0) {
              cy.get(".tags-input").find("input.input").type("{enter}");
            } else {
              expect($filtered.length).to.equal(1);
              cy.wrap($filtered).should("be.visible").click();
            }
          });
      }

      cy.get(".dropdown-menu").should("not.be.visible");

      const tagValues = [...addTagValues, ...existingTagValuesAfterRemoved];

      cy.get(".tags-input").find("span.tag[data-value]").should("have.length", tagValues.length);
      cy.get('[data-test="' + options.selectorId + '-tags-counter"]')
        .should("be.visible")
        .should("have.text", `counter: ${tagValues.length}/10`);

      cy.get(".tags-input").within(() => {
        for (let tagValue of tagValues) {
          cy.get('span[data-value="' + tagValue + '"]').should("be.visible");
        }
      });
    });
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
