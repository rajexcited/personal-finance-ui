import { IndexedDbName } from "../../plugins/indexedDb/resource";
import { ApiConfigTypeResource, ConfigBelongsTo } from "../../support/api-resource-types";

export const configStoreName = "config-store";

export const getPaymentAccountTypesFromApi = (typeNames: string[]) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return cy
      .indexedDb(IndexedDbName.MockExpense)
      .getItems<ApiConfigTypeResource>({ storeName: configStoreName, indexName: "belongsTo-index" }, ConfigBelongsTo.PaymentAccountType)
      .then((paymentAccountTypes) => {
        console.log(typeNames);
        console.log(paymentAccountTypes);

        const res = paymentAccountTypes.filter((configResource) => typeNames.includes(configResource.name));
        return res || [];
      });
  }
  return cy.wrap([]);
};
