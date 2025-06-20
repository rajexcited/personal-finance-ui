import { EnvId } from "./resource-types";

export const getFixtureFile = (fileFor: "users" | "payment-accounts") => {
  const pathDetails = getFixtureRootPathDetails();
  return cy.fixture(`${pathDetails.rootPath}/${fileFor}/${pathDetails.envId}.json`);
};

export const getFixtureRootPathDetails = () => {
  let uiVersion: string = Cypress.env("UI_VERSION");
  const envId = <EnvId>Cypress.env("ENV_ID");

  if (envId === EnvId.Local) {
    uiVersion = "development";
  }
  if (!uiVersion) {
    throw new Error(`ui version is not provided for env [${envId}]. cannot fetch the users`);
  }
  return {
    rootPath: uiVersion,
    envId: envId
  };
};
