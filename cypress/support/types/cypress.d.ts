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
     * wait for page load spinner
     * @param waitOnSec Optional. if not provided default value is 60 sec
     */
    waitForPageLoad(waitOnSec?: number): Chainable<void>;
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
     * click on logout from navbar and wait to make sure public links are exists
     */
    logoutFromNav(): Chainable<void>;
    /**
     * logins to UI and make user session active to access secured functionality
     */
    loginThroughUI(userRef: string): Chainable<void>;
    getCurrencyProfile(): Chainable<ApiCurrencyProfileResource>;
    selectDropdownItem(options: {
      dropdownSelectorId: string;
      selectNewItemText: string;
      selectedItemText?: string;
      requiredError: boolean;
    }): Chainable<void>;
    validateDropdownSelectedItem(options: { dropdownSelectorId: string; selectedItemText?: string; requiredError: boolean }): Chainable<void>;
    selectTags(options: { tagsSelectorId: string; addTagValues: string[]; existingTagValues: string[]; removeTagValues: string[] }): Chainable<void>;
    selectSharePersonTags(options: { selectorId: string; addValues: string[]; existingValues: string[]; removeValues: string[] }): Chainable<void>;
    verifyCurrencySection<E extends Node = HTMLElement>(): Chainable<JQuery<E>>;
  }
}
