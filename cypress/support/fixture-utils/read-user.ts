import { getFixtureFile } from "./fixture-util";

export interface UserDetailType {
  ref: string;
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  countryText: string;
  countryCode: string;
}

const aliasName = "userMap";
beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

const populateUserMap = () => {
  return getFixtureFile("users").then((data) => {
    const userMap: Record<string, UserDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as UserDetailType) : null;
      userMap[key] = {
        ref: key,
        firstName: val?.firstName || "",
        lastName: val?.lastName || "",
        emailId: val?.emailId || "",
        password: val?.password || "",
        countryText: val?.countryText || "",
        countryCode: val?.countryCode || ""
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} users are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} users are populated. ref keys: ${refKeys}`);
    cy.wrap(userMap).as(aliasName);
  });
};

const findUser = (userMap: Record<string, UserDetailType>, userRef: string) => {
  if (userMap[userRef]) {
    return userMap[userRef];
  }
  throw new Error(`No matching user found for ref [${userRef}]`);
};

/**
 * reads user details from fixture test data setup file
 *
 * @param userRef
 * @returns
 */
export const getUserDetails = (userRef: string) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const userMap: Record<string, UserDetailType> = data;
    if (Object.keys(userMap).length === 0) {
      populateUserMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => findUser(data, userRef));
};
