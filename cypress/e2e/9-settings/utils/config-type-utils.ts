import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import { ApiConfigTypeResource, ConfigBelongsTo, ConfigStatus } from "../../../support/api-resource-types";
import { formatTimestamp } from "../../../support/date-utils";
import { ConfigDetailType, getConfigType, updateConfigType } from "../../../support/fixture-utils/read-config-type";
import { v4 as uuidv4 } from "uuid";

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
    id: configDetails.id || uuidv4(),
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
export const getIncomeTypesFromApi = (options: { typeNames: string[] }) => {
  return getConfigTypesFromApi(ConfigBelongsTo.IncomeType, options.typeNames);
};

const createOrUpdateConfigType = (belongsTo: ConfigBelongsTo, configTypeOptions: { ref: string; status: ConfigStatus }) => {
  getConfigType(belongsTo, configTypeOptions.ref).then((configTypeData) => {
    if (!configTypeData) {
      throw new Error(`cannot create or update ${belongsTo} as data not found for ref [${configTypeOptions.ref}]`);
    }
    if (configTypeData.id) {
      // update directly
      createOrUpdateConfigTypeViaApi(configTypeData, configTypeOptions.status);
    } else {
      getConfigTypesFromApi(belongsTo, [configTypeData.name]).then((datalist) => {
        if (!datalist.length) {
          // create
          createOrUpdateConfigTypeViaApi(configTypeData, configTypeOptions.status);
        } else {
          // update
          createOrUpdateConfigTypeViaApi({ ...configTypeData, id: datalist[0].id! }, configTypeOptions.status);
        }
      });
      getConfigTypesFromApi(belongsTo, [configTypeData.name]).then((datalist) => {
        if (datalist.length) {
          const apiData = datalist[0];
          const data: ConfigDetailType = {
            ...configTypeData,
            id: apiData.id!
          };
          updateConfigType(belongsTo, configTypeOptions.ref, data);
        }
      });
    }
  });
};

export const createOrUpdatePurchaseType = (purchaseTypeOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.PurchaseType, purchaseTypeOptions);
};
export const createOrUpdateIncomeType = (incomeTypeOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.IncomeType, incomeTypeOptions);
};
