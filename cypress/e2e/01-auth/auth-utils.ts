import { NavBarSelectors } from "../../support/resource-types";

const publicLinks = [NavBarSelectors.SignupNavlink, NavBarSelectors.LoginNavlink];
const securedLinks = [
  NavBarSelectors.ExpenseNavlink,
  NavBarSelectors.PaymentAccountNavlink,
  NavBarSelectors.SettingsNavlink,
  NavBarSelectors.LogoutNavlink
];

const verifyLinks = (links: string[], shouldExist: boolean) => {
  links.forEach((selector) => {
    cy.get(selector).should(shouldExist ? "exist" : "not.exist");
  });
};

export const verifyPublicLinks = (shouldExists: boolean) => {
  verifyLinks(publicLinks, shouldExists);
};
export const verifySecuredLinks = (shouldExists: boolean) => {
  verifyLinks(securedLinks, shouldExists);
};

export const verifySecuredLinksFunctional = () => {
  cy.clickNavLinkAndWait(NavBarSelectors.ExpenseNavlink);
  cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountNavlink);
  cy.clickNavLinkAndWait(NavBarSelectors.SettingsNavlink);
  cy.openNavMenu();
  cy.get(NavBarSelectors.LogoutNavlink).should("be.visible");
};
