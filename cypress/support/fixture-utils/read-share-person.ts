import { ConfigBelongsTo } from "../api-resource-types";
import { getFixtureFile } from "./fixture-util";

export interface SharePersonType {
  ref: string;
  id: string;
  emailId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  belongsTo: ConfigBelongsTo.SharePerson;
  description: string;
  tags: string[];
}

const aliasName = "configSharePersonMap";

beforeEach(() => {
  cy.wrap({}).as(aliasName);
});

export const updateSharePerson = (sharePersonData: SharePersonType) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const sharePersonMap: Record<string, SharePersonType> = data;
    sharePersonMap[sharePersonData.ref] = sharePersonData;
    cy.wrap(sharePersonMap).as(aliasName);
  });
};

const populateSharePersonMap = () => {
  getFixtureFile("settings/config-types/share-person").then((data) => {
    const sharePersonMap: Record<string, SharePersonType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as SharePersonType) : null;
      sharePersonMap[key] = {
        ref: key,
        id: "",
        emailId: val?.emailId || "",
        firstName: val?.firstName || "",
        lastName: val?.lastName || "",
        nickName: val?.nickName || "",
        belongsTo: ConfigBelongsTo.SharePerson,
        tags: val?.tags || [],
        description: val?.description || ""
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} share person config are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} share person config are populated. ref keys: ${refKeys}`);
    cy.wrap(sharePersonMap).as(aliasName);
  });
};

const findSharePerson = (sharePersonMap: Record<string, SharePersonType>, sharePersonRef: string) => {
  if (sharePersonMap[sharePersonRef]) {
    return sharePersonMap[sharePersonRef];
  }
  throw new Error(`No matching share person config type found for ref [${sharePersonRef}]`);
};

/**
 * reads expense purchase details from fixture test data setup file
 *
 * @param expensePurchaseRefs
 * @returns
 */
export const getSharePersonList = (sharePersonRefs: string[]) => {
  cy.get(`@${aliasName}`).then((data: any) => {
    const sharePersonMap: Record<string, SharePersonType> = data;
    if (Object.keys(sharePersonMap).length === 0) {
      populateSharePersonMap();
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const configTypeMap: Record<string, SharePersonType> = data;
    const nonNullRefs = sharePersonRefs.filter((r) => r !== null && r !== undefined).filter((r) => !!r);
    const results = nonNullRefs.map((ref) => findSharePerson(configTypeMap, ref)).filter((cdt) => cdt !== null);
    return results;
  });
};

export const getSharePerson = (sharePersonRef: string) => {
  return getSharePersonList([sharePersonRef]).then((list) => {
    return cy.wrap(list[0]);
  });
};
