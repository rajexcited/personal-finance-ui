// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "./chai";
import registerCypressGrep from "@cypress/grep";
import "cypress-mochawesome-reporter/register";
import "../plugins/reporter-helper";
import "cypress-real-events";

registerCypressGrep();

const registerAccessTokenExtractor = () => {
  const siteUrl = Cypress.config("baseUrl") || "";
  const domain = new URL(siteUrl).hostname;
  console.log("siteUrl=", siteUrl);
  // assuming each tests are completed within 5 minutes
  const ageInSeconds = 5 * 60;
  cy.fixture("idb-bundle.js.txt").then((scriptContent) => {
    cy.intercept("GET", siteUrl, (req) => {
      req.continue((res) => {
        // console.log("get called in response");
        const testCookieValue = Cypress.env("E2E_TEST_COOKIE_VALUE");
        const newResponseCookie = `automation=${testCookieValue}; Domain=${domain}; Path=/; Secure; Max-Age=${ageInSeconds}`;
        const existingResponseCookies = res.headers["set-cookie"] || [];
        res.headers["set-cookie"] = [...existingResponseCookies, newResponseCookie];
        // console.log("response cookies=", res.headers["Cookie"]);
      });
    });
  });
};

/**
 * Set a secure short lived cookie to indicate the website to be ready for automation e2e test
 */
beforeEach(() => {
  registerAccessTokenExtractor();
  Cypress.env("testStartTime", new Date().toISOString());
});

before(() => {
  if (!Cypress.browser.isHeadless) {
    // to re-initialize mock data for test
    cy.deleteIndexedDb();
  }
});

Cypress.on("fail", (err) => {
  const accessToken = Cypress.env("accessToken");
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (accessToken && apiBaseUrl) {
    cy.request({
      method: "POST",
      url: apiBaseUrl + "/user/logout",
      headers: {
        Authorization: accessToken
      }
    });
  }
  throw err;
});
