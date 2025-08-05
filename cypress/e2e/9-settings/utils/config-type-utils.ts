import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import { ApiConfigTypeResource, ConfigBelongsTo, ConfigStatus } from "../../../support/api-resource-types";
import { dateTimestampFormatApi, formatTimestamp } from "../../../support/date-utils";
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

const dispatchApiGetList = (belongsTo: ConfigBelongsTo, typeNames: string[]) => {
  const filterByTypes = (configList: ApiConfigTypeResource[]) => {
    return configList.filter((configResource) => typeNames.includes(configResource.name));
  };
  return cy
    .indexedDb(IndexedDbName.Expense)
    .getItems<ApiConfigTypeResource>({ storeName: configStoreName, indexName: belongsToIndexInStore }, belongsTo)
    .then((configTypes) => {
      const res = filterByTypes(configTypes);
      console.log("from expenseDb, typeNames: ", typeNames, "; configTypes: ", configTypes, "; results: ", res);
      if (res.length === typeNames.length) {
        return cy.wrap(res);
      }

      const apiBaseUrl = Cypress.env("API_BASE_URL");
      if (!apiBaseUrl) {
        return cy
          .indexedDb(IndexedDbName.MockExpense)
          .getItems<ApiConfigTypeResource>({ storeName: configStoreName, indexName: belongsToIndexInStore }, belongsTo)
          .then((configTypes) => {
            const res = filterByTypes(configTypes);
            console.log("from mockExpenseDb, typeNames: ", typeNames, "; configTypes: ", configTypes, "; results: ", res);
            return res;
          });
      }

      return cy
        .request({
          method: "GET",
          url: `${apiBaseUrl}/config/types/belongs-to/${belongsTo}?status=enable&status=disable`,
          headers: {
            Authorization: Cypress.env("accessToken")
          }
        })
        .then((response) => {
          expect(response.body).to.be.an("array");
          const configTypes = response.body as ApiConfigTypeResource[];
          const res = filterByTypes(configTypes);
          console.log("from api, typeNames: ", typeNames, "; configTypes: ", configTypes, "; results: ", res);
          return res;
        });
    });
};

const dispatchApiAddUpdate = (configDetails: ConfigDetailType, status: ConfigStatus) => {
  const apiConfigDetails: ApiConfigTypeResource = {
    belongsTo: configDetails.belongsTo,
    name: configDetails.name,
    status: status,
    tags: configDetails.tags,
    value: configDetails.value,
    description: configDetails.description,
    id: configDetails.id || uuidv4(),
    auditDetails: {
      createdOn: formatTimestamp(new Date(), dateTimestampFormatApi),
      updatedOn: formatTimestamp(new Date(), dateTimestampFormatApi)
    }
  };

  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    cy.indexedDb(IndexedDbName.MockExpense).updateItems([apiConfigDetails], { storeName: configStoreName });
    clearDbCache(configDetails.belongsTo);
    return cy.wrap(apiConfigDetails);
  }

  return cy
    .request({
      method: "POST",
      url: `${apiBaseUrl}/config/types/belongs-to/${configDetails.belongsTo}`,
      headers: {
        Authorization: Cypress.env("accessToken")
      },
      body: apiConfigDetails
    })
    .then((response) => {
      expect(response.status).to.greaterThan(199).and.to.lessThan(202);
      expect(response.body).to.be.an("object");

      clearDbCache(configDetails.belongsTo);
      return cy.wrap(response.body as ApiConfigTypeResource);
    });
};

export const getPaymentAccountTypesFromApi = (typeNames: string[]) => {
  return dispatchApiGetList(ConfigBelongsTo.PaymentAccountType, typeNames);
};

export const getPurchaseTypesFromApi = (options: { typeNames: string[] }) => {
  return dispatchApiGetList(ConfigBelongsTo.PaymentAccountType, options.typeNames);
};
export const getIncomeTypesFromApi = (options: { typeNames: string[] }) => {
  return dispatchApiGetList(ConfigBelongsTo.IncomeType, options.typeNames);
};
export const getRefundReasonsFromApi = (options: { typeNames: string[] }) => {
  return dispatchApiGetList(ConfigBelongsTo.RefundReason, options.typeNames);
};

const createOrUpdateConfigType = (belongsTo: ConfigBelongsTo, configTypeOptions: { ref: string; status: ConfigStatus }) => {
  getConfigType(belongsTo, configTypeOptions.ref).then((configTypeData) => {
    if (!configTypeData) {
      throw new Error(`cannot create or update ${belongsTo} as data not found for ref [${configTypeOptions.ref}]`);
    }
    dispatchApiGetList(belongsTo, [configTypeData.name]).then((datalist) => {
      const matchedConfigDetails = datalist.find((cfgData) => cfgData.id === configTypeData.id);
      if (matchedConfigDetails) {
        // update directly
        dispatchApiAddUpdate(configTypeData, configTypeOptions.status);
      } else if (datalist.length) {
        // update
        const data = { ...configTypeData, id: datalist[0].id };
        dispatchApiAddUpdate(data, configTypeOptions.status).then((updatedData) => {
          updateConfigType(belongsTo, configTypeOptions.ref, data);
        });
      } else {
        // create
        dispatchApiAddUpdate({ ...configTypeData, id: "" }, configTypeOptions.status).then((updatedData) => {
          updateConfigType(belongsTo, configTypeOptions.ref, { ...configTypeData, id: updatedData.id });
        });
      }
    });
  });
};

export const createOrUpdatePurchaseType = (purchaseTypeOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.PurchaseType, purchaseTypeOptions);
};
export const createOrUpdateIncomeType = (incomeTypeOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.IncomeType, incomeTypeOptions);
};
export const createOrUpdateRefundReason = (refundReasonOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.RefundReason, refundReasonOptions);
};
export const createOrUpdatePaymentAccountType = (paymentAccountTypeOptions: { ref: string; status: ConfigStatus }) => {
  createOrUpdateConfigType(ConfigBelongsTo.PaymentAccountType, paymentAccountTypeOptions);
};
