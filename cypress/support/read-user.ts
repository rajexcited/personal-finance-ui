import { EnvId } from "./resource-types";

export interface UserType {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  countryText: string;
  countryCode: string;
}

const userMap: Record<string, UserType> = {};
let userMapSize = 0;
export const findUser = (userRef: string) => {
  if (userMap[userRef]) {
    return userMap[userRef];
  }
  throw new Error(`No matching user found for ref [${userRef}]`);
};
export const getUserDetails = (userRef: string) => {
  let uiVersion: string = Cypress.env("UI_VERSION");
  const envId = <EnvId>Cypress.env("ENV_ID");
  console.log();
  if (envId === EnvId.Local) {
    uiVersion = "development";
  }
  if (!uiVersion) {
    throw new Error(`ui version is not provided for env [${envId}]. cannot fetch the users`);
  }
  if (userMapSize === 0) {
    return cy.fixture(`${uiVersion}/users/${envId}.json`).then((data) => {
      cy.log(`read test data file. data=${data}`);
      Object.entries(data).forEach(([key, value]) => {
        const val = typeof value === "object" ? (value as UserType) : null;
        userMap[key] = {
          firstName: val?.firstName || "",
          lastName: val?.lastName || "",
          emailId: val?.emailId || "",
          password: val?.password || "",
          countryText: val?.countryText || "",
          countryCode: val?.countryCode || ""
        };
      });
      return cy.wrap(findUser(userRef));
    });
  }
  return cy.wrap(findUser(userRef));
};
