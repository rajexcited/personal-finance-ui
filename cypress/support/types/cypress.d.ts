/// <reference types="cypress" />

declare module "@cypress/grep";
declare module "cypress-mochawesome-reporter";

type CustomDevicePreset = "desktop" | "pixel9-pro";

declare namespace Cypress {
  interface Chainable {
    setViewport(device: CustomDevicePreset | ViewportPreset, orientation?: ViewportOrientation): Chainable<null>;
    enterSignupDetails(userRef: string): Chainable<UserType>;
    openNavMenu(): Chainable<void>;
    clearIndexedDB(): Chainable<void>;
  }
}
