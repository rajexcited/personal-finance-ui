import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import { ApiConfigTypeResource, ConfigBelongsTo, ConfigStatus } from "../../../support/api-resource-types";
import { formatTimestamp } from "../../../support/date-utils";
import { ConfigDetailType, getPurchaseType, updatePurchaseType } from "../../../support/fixture-utils/read-config-type";

export const configStoreName = "config-store";
const belongsToIndexInStore = "belongsTo-index";

const clearDbCache = (belongsTo: ConfigBelongsTo) => {
  console.log("deleting cached items", [belongsTo, `/config/types/belongs-to/${belongsTo}`]);
  cy.indexedDb(IndexedDbName.Expense).deleteItems([belongsTo, `/config/types/belongs-to/${belongsTo}`], {
    storeName: configStoreName,
    indexName: belongsToIndexInStore
  });
};

const getConfigTypesFromApi = (belongsTo: ConfigBelongsTo, typeNames: string[]) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return cy
      .indexedDb(IndexedDbName.MockExpense)
      .getItems<ApiConfigTypeResource>({ storeName: configStoreName, indexName: belongsToIndexInStore }, belongsTo)
      .then((configTypes) => {
        console.log("typeNames: ", typeNames, "configTypes: ", configTypes);

        const res = configTypes.filter((configResource) => typeNames.includes(configResource.name));
        return res || [];
      });
  }
  return cy.wrap([]);
};

const createOrUpdateConfigTypeViaApi = (configDetails: ConfigDetailType, status: ConfigStatus) => {
  const apiConfigDetails: ApiConfigTypeResource = {
    belongsTo: configDetails.belongsTo,
    name: configDetails.name,
    status: status,
    tags: configDetails.tags,
    value: configDetails.value,
    description: configDetails.description,
    id: configDetails.id || "new-id",
    auditDetails: {
      createdOn: formatTimestamp(new Date()),
      updatedOn: formatTimestamp(new Date())
    }
  };

  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    cy.indexedDb(IndexedDbName.MockExpense).updateItems([apiConfigDetails], { storeName: configStoreName });
    clearDbCache(configDetails.belongsTo);
  }
};

export const getPaymentAccountTypesFromApi = (typeNames: string[]) => {
  return getConfigTypesFromApi(ConfigBelongsTo.PaymentAccountType, typeNames);
};

export const getPurchaseTypesFromApi = (options: { typeNames: string[] }) => {
  return getConfigTypesFromApi(ConfigBelongsTo.PaymentAccountType, options.typeNames);
};

export const createOrUpdatePurchaseType = (purchaseTypeOptions: { ref: string; status: ConfigStatus }) => {
  getPurchaseType(purchaseTypeOptions.ref).then((purchaseTypeData) => {
    if (!purchaseTypeData) {
      throw new Error("cannot create or update purchase type as data not found");
    }
    if (purchaseTypeData.id) {
      // update directly
      createOrUpdateConfigTypeViaApi(purchaseTypeData, purchaseTypeOptions.status);
    } else {
      getPurchaseTypesFromApi({ typeNames: [purchaseTypeData.name] }).then((datalist) => {
        if (!datalist.length) {
          // create
          createOrUpdateConfigTypeViaApi(purchaseTypeData, purchaseTypeOptions.status);
        } else {
          // update
          createOrUpdateConfigTypeViaApi({ ...purchaseTypeData, id: datalist[0].id! }, purchaseTypeOptions.status);
        }
      });
      getPurchaseTypesFromApi({ typeNames: [purchaseTypeData.name] }).then((datalist) => {
        if (datalist.length) {
          const apiData = datalist[0];
          const data: ConfigDetailType = {
            ...purchaseTypeData,
            id: apiData.id!
          };
          updatePurchaseType(purchaseTypeOptions.ref, data);
        }
      });
    }
  });
};
