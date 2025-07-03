import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import {
  ApiPaymentAccountResource,
  PaymentAccountStatus,
  ApiCurrencyProfileResource,
  ApiConfigTypeResource
} from "../../../support/api-resource-types";
import { getPaymentAccountList, PaymentAccountDetailType, updatePaymentAccount } from "../../../support/fixture-utils/read-payment-account";
import { v4 as uuidv4 } from "uuid";
import { getPaymentAccountTypesFromApi } from "../../9-settings/utils/config-type-utils";

const paymentAccountStore = "pymt-account-store";

const convertToApiResource = (
  paymentAccountData: PaymentAccountDetailType,
  status: PaymentAccountStatus,
  currencyProfile: ApiCurrencyProfileResource
) => {
  const apiBody: ApiPaymentAccountResource = {
    id: paymentAccountData.id,
    shortName: paymentAccountData.shortName,
    institutionName: paymentAccountData.institutionName,
    accountIdNum: paymentAccountData.accountName,
    typeId: paymentAccountData.accountTypeId,
    description: paymentAccountData.description,
    status: status,
    tags: paymentAccountData.tags,
    currencyProfileId: currencyProfile.id!,
    auditDetails: {
      createdOn: "",
      updatedOn: ""
    }
  };
  return apiBody;
};

export const createOrUpdatePaymentAccount = (requests: Array<{ ref: string; status: PaymentAccountStatus }>) => {
  console.log("createOrUpdatePaymentAccount, requests=", requests);
  const paymentAccountRequestMap = requests.reduce((obj, req) => {
    obj[req.ref] = req.status;
    return obj;
  }, {} as Record<string, PaymentAccountStatus>);
  getPaymentAccountList(Object.keys(paymentAccountRequestMap)).then((paymentAccountDataList) => {
    const apiBaseUrl = Cypress.env("API_BASE_URL");

    cy.getCurrencyProfile().then((currencyProfile) => {
      if (apiBaseUrl) {
        // call post api and update
        const pymtAccApiUrl = Cypress.env("API_BASE_URL") + "/payment/accounts";
        const apiResources = paymentAccountDataList.map((paymentAccountData) =>
          convertToApiResource(paymentAccountData, paymentAccountRequestMap[paymentAccountData.ref], currencyProfile)
        );

        for (const apiBody of apiResources) {
          cy.request({
            method: "POST",
            url: pymtAccApiUrl,
            body: apiBody,
            headers: {
              Authorization: Cypress.env("accessToken")
            }
          }).then((response) => {
            console.log("response=", response);
          });
        }
      } else {
        // update mock indexDb
        return cy
          .indexedDb(IndexedDbName.MockExpense)
          .getItems<ApiPaymentAccountResource>({ storeName: paymentAccountStore })
          .then((pymtAccList) => {
            console.log("results", pymtAccList);
            getPaymentAccountTypesFromApi(paymentAccountDataList.map((pymtAcc) => pymtAcc.accountTypeName)).then((paymentAccountTypes) => {
              const paymentAccountTypeMap = paymentAccountTypes.reduce((acc, curr) => {
                acc[curr.name] = curr;
                return acc;
              }, {} as Record<string, ApiConfigTypeResource>);
              const paymentAccountMap: Record<string, ApiPaymentAccountResource> = {};
              pymtAccList.forEach((paymentAccount) => {
                if (!paymentAccountMap[paymentAccount.shortName]) {
                  paymentAccountMap[paymentAccount.shortName] = paymentAccount;
                } else if (paymentAccountMap[paymentAccount.shortName].status === "deleted" && paymentAccount.status !== "deleted") {
                  paymentAccountMap[paymentAccount.shortName] = paymentAccount;
                }
              });

              const apiResources = paymentAccountDataList.map((paymentAccountData) => {
                const apiRes = convertToApiResource(paymentAccountData, paymentAccountRequestMap[paymentAccountData.ref], currencyProfile);
                if (!apiRes.id) {
                  if (paymentAccountMap[apiRes.shortName]) {
                    apiRes.id = paymentAccountMap[apiRes.shortName].id;
                  } else {
                    apiRes.id = uuidv4();
                  }
                }
                paymentAccountData.id = apiRes.id;
                paymentAccountData.accountTypeId = apiRes.typeId;
                apiRes.typeId = paymentAccountTypeMap[paymentAccountData.accountTypeName].id || "NA";
                // special case for local
                console.log(paymentAccountMap, apiRes);
                if (paymentAccountMap[apiRes.shortName]?.status === "immutable") {
                  apiRes.status = "immutable";
                }
                return apiRes;
              });

              for (let paymentAccountData of paymentAccountDataList) {
                updatePaymentAccount(paymentAccountData.ref, paymentAccountData);
              }

              // update
              console.log("updating api resource ", apiResources);
              cy.indexedDb(IndexedDbName.MockExpense).updateItems(apiResources, { storeName: paymentAccountStore });
              cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: paymentAccountStore });
            });
          });
      }
      // reset the indexDb cache to ensure api hit
    });
  });
};
