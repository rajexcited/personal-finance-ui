/// <reference types="cypress" />

declare module "@cypress/grep";
declare module "cypress-mochawesome-reporter";

type CustomDevicePreset = "desktop" | "pixel9-pro";

declare namespace Cypress {
  interface Chainable {
    /**
     * Changes the windows viewport size by preset
     */
    setViewport(device: CustomDevicePreset | ViewportPreset, orientation?: ViewportOrientation): Chainable<null>;
    /**
     * find user details by reference id and update input fields with details
     */
    enterSignupDetails(userRef: string): Chainable<UserType>;
    createUser(userRef: string): Chainable<UserType>;
    /**
     * in large or small responsive screen, navbar style and functioning slight varies.
     * if navbar is not visible, open nav bar
     */
    openNavMenu(): Chainable<void>;
    /**
     * in large or small responsive screen, open nav bar if needed and click the navbar. wait for page to be loaded.
     */
    clickNavLinkAndWait(navSelector: NavBarSelectors, timeoutInSec?: number): Chainable<void>;
    /**
     * clear indexDb cache. between spec executions, indexDb databases are cleared.
     * But within spec, all executions share the same cache data, only cookies, localData and sessionData are getting cleared each tests.
     * This is useful when starting test fresh specifically among different viewports.
     */
    clearIndexedDB(): Chainable<void>;
  }
}
