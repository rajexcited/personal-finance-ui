import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import {
  ApiPaymentAccountResource,
  PaymentAccountStatus,
  ApiCurrencyProfileResource,
  ApiConfigTypeResource
} from "../../../support/api-resource-types";
import { getPaymentAccountList, PaymentAccountDetailType, updatePaymentAccount } from "../../../support/fixture-utils/read-payment-account";
import { v4 as uuidv4 } from "uuid";
import { createOrUpdatePaymentAccountType, getPaymentAccountTypesFromApi } from "../../9-settings/utils/config-type-utils";
import { getPaymentAccountType } from "../../../support/fixture-utils/read-config-type";

const paymentAccountStore = "pymt-account-store";

const convertToApiResource = (
  paymentAccountData: PaymentAccountDetailType,
  status: PaymentAccountStatus,
  currencyProfile: ApiCurrencyProfileResource,
  paymentAccountApiMap: Record<string, ApiPaymentAccountResource>
) => {
  const paymentAccountApi: ApiPaymentAccountResource | null = paymentAccountApiMap[paymentAccountData.shortName];
  const paymentAccountStatus = paymentAccountApi?.status === "immutable" ? paymentAccountApi.status : status;
  const apiBody: ApiPaymentAccountResource = {
    id: paymentAccountData.id || paymentAccountApi?.id || uuidv4(),
    shortName: paymentAccountData.shortName,
    institutionName: paymentAccountData.institutionName,
    accountIdNum: paymentAccountData.accountName,
    typeId: paymentAccountData.accountTypeId,
    description: paymentAccountData.description,
    status: paymentAccountStatus,
    tags: paymentAccountData.tags,
    currencyProfileId: currencyProfile.id,
    auditDetails: {
      createdOn: paymentAccountApi?.auditDetails.createdOn || "",
      updatedOn: ""
    }
  };
  return apiBody;
};

const getPaymentAccountUrl = () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    return apiBaseUrl + "/payment/accounts";
  }
  throw new Error("api baseUrl is not found");
};

const dispatchApiAddUpdate = (apiResource: ApiPaymentAccountResource) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    return cy
      .request({
        method: "POST",
        url: getPaymentAccountUrl(),
        body: apiResource,
        headers: {
          Authorization: Cypress.env("accessToken")
        }
      })
      .then((response) => {
        console.log("response=", response);
        expect(response.status).to.least(200);
        expect(response.body).to.an("object");
        return response.body as ApiPaymentAccountResource;
      });
  }
  return cy
    .indexedDb(IndexedDbName.MockExpense)
    .updateItems([apiResource], { storeName: paymentAccountStore })
    .then((updatedResources) => {
      return updatedResources[0];
    });
};

const dispatchApiGetList = () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    return cy
      .request({
        method: "GET",
        url: getPaymentAccountUrl(),
        qs: {
          status: "enable"
        },
        headers: {
          Authorization: Cypress.env("accessToken")
        }
      })
      .then((response) => {
        console.log("response=", response);
        expect(response.status).to.equals(200);
        expect(response.body).to.an("array");
        expect(response.body.length).to.least(1);
        return response.body as ApiPaymentAccountResource[];
      });
  }
  // local
  return cy.indexedDb(IndexedDbName.MockExpense).getItems<ApiPaymentAccountResource>({ storeName: paymentAccountStore });
};

export const createOrUpdatePaymentAccount = (requests: Array<{ ref: string; status: PaymentAccountStatus }>) => {
  console.log("createOrUpdatePaymentAccount, requests=", requests);
  const paymentAccountRequestMap = requests.reduce((obj, req) => {
    obj[req.ref] = req.status;
    return obj;
  }, {} as Record<string, PaymentAccountStatus>);
  getPaymentAccountList(Object.keys(paymentAccountRequestMap)).then((paymentAccountDataList) => {
    for (const paymentAccountData of paymentAccountDataList) {
      createOrUpdatePaymentAccountType({
        ref: paymentAccountData.accountTypeRef,
        status: "enable"
      });
    }

    cy.getCurrencyProfile().then((currencyProfile) => {
      dispatchApiGetList().then((paymentAccountApiList) => {
        // api map to lookup to create addUpdate resource
        const paymentAccountApiMap: Record<string, ApiPaymentAccountResource> = {};
        paymentAccountApiList.forEach((paymentAccountApi) => {
          if (!paymentAccountApiMap[paymentAccountApi.shortName]) {
            paymentAccountApiMap[paymentAccountApi.shortName] = paymentAccountApi;
          } else if (paymentAccountApiMap[paymentAccountApi.shortName].status === "deleted" && paymentAccountApi.status !== "deleted") {
            paymentAccountApiMap[paymentAccountApi.shortName] = paymentAccountApi;
          }
        });

        console.log("paymentAccountApiMap=", paymentAccountApiMap);

        for (const paymentAccountData of paymentAccountDataList) {
          const apiResource = convertToApiResource(
            paymentAccountData,
            paymentAccountRequestMap[paymentAccountData.ref],
            currencyProfile,
            paymentAccountApiMap
          );
          if (!apiResource.typeId) {
            getPaymentAccountType(paymentAccountData.accountTypeRef).then((paymentAccTypeData) => {
              if (!paymentAccTypeData) {
                throw new Error("missing payment account type data");
              }
              if (paymentAccountApiMap[paymentAccountData.shortName]) {
                updatePaymentAccount(paymentAccountData.ref, {
                  ...paymentAccountData,
                  id: paymentAccountApiMap[paymentAccountData.shortName].id,
                  accountTypeId: paymentAccTypeData.id
                });
              }
              dispatchApiAddUpdate({ ...apiResource, typeId: paymentAccTypeData.id });
              // reset the indexDb cache to ensure api hit
              cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: paymentAccountStore });
            });
          } else {
            if (paymentAccountApiMap[paymentAccountData.shortName]) {
              updatePaymentAccount(paymentAccountData.ref, { ...paymentAccountData, id: paymentAccountApiMap[paymentAccountData.shortName].id });
            }
            dispatchApiAddUpdate(apiResource);
            // reset the indexDb cache to ensure api hit
            cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: paymentAccountStore });
          }
        }
      });
    });
  });
};
