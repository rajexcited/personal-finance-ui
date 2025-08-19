import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import {
  ApiCurrencyProfileResource,
  ApiResourceIncomeDetails,
  ApiResourcePurchaseDetails,
  ApiResourcePurchaseItemDetails,
  ApiResourceReceipt,
  ApiResourceRefundDetails,
  ExpenseBelongsTo,
  ExpenseStatus,
  ReceiptContentType
} from "../../../support/api-resource-types";
import { dateTimestampFormatApi, expenseDateFormatFixture, formatTimestamp, parseTimestamp, addMonths } from "../../../support/date-utils";
import { ConfigDetailType, getIncomeType, getPurchaseTypeList, getRefundReason } from "../../../support/fixture-utils/read-config-type";
import { ExpensePurchaseDetailType, getExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";
import { getPaymentAccount, PaymentAccountDetailType } from "../../../support/fixture-utils/read-payment-account";
import { createOrUpdatePaymentAccount } from "../../5-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType, createOrUpdatePurchaseType, createOrUpdateRefundReason } from "../../5-settings/utils/config-type-utils";
import { v4 as uuidv4, validate } from "uuid";
import { ExpenseIncomeDetailType, getExpenseIncome } from "../../../support/fixture-utils/read-expense-income";
import { ExpenseRefundDetailType, getExpenseRefund, updateExpenseRefund } from "../../../support/fixture-utils/read-expense-refund";

interface DbReceiptFileResource {
  filedata: ArrayBuffer;
  name: string;
  id: string;
  createdOn: Date;
  relationId: string;
  belongsTo: ExpenseBelongsTo;
}

const expenseStoreName = "expense-items-store";
const receiptStoreName = "receipt-items-store";

const maxWaitInMillis = 60 * 1000;

type UnionApiResourceExpenseDetails = ApiResourcePurchaseDetails | ApiResourceIncomeDetails | ApiResourceRefundDetails;
type ApiResourceExpenseDetailsMap = {
  [ExpenseBelongsTo.Purchase]: ApiResourcePurchaseDetails;
  [ExpenseBelongsTo.Income]: ApiResourceIncomeDetails;
  [ExpenseBelongsTo.Refund]: ApiResourceRefundDetails;
};
type ExpenseDetailTypeMap = {
  [ExpenseBelongsTo.Purchase]: ExpensePurchaseDetailType;
  [ExpenseBelongsTo.Income]: ExpenseIncomeDetailType;
  [ExpenseBelongsTo.Refund]: ExpenseRefundDetailType;
};

const getExpenseUrl = (belongsTo: ExpenseBelongsTo) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (apiBaseUrl) {
    return `${apiBaseUrl}/expenses/${belongsTo}`;
  }
  throw new Error("expense api baseUrl is not found for " + belongsTo);
};

const dispatchApiReceiptAdd = (dbItem: DbReceiptFileResource, contentType: ReceiptContentType, binaryString: string) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  const fileArrayBuffer = Cypress.Blob.binaryStringToArrayBuffer(binaryString);
  console.log("file array buffer: ", fileArrayBuffer.byteLength, fileArrayBuffer);
  if (!apiBaseUrl) {
    return cy.indexedDb(IndexedDbName.MockExpense).updateItems([{ ...dbItem, filedata: fileArrayBuffer }], { storeName: receiptStoreName });
  }

  const blobdata = Cypress.Blob.binaryStringToBlob(binaryString, contentType);
  // console.log("blobData: ", blobdata, "setting to formData");

  return cy
    .request({
      method: "POST",
      url: `${getExpenseUrl(dbItem.belongsTo)}/id/${dbItem.relationId}/receipts/id/${dbItem.id}`,
      body: blobdata,
      headers: {
        Authorization: Cypress.env("accessToken"),
        "Content-Type": contentType
      },
      encoding: "binary"
    })
    .then((response) => {
      console.log("receipt upload response=", response);
      expect(response.status).to.equals(200);
    });
};

const prepareExpenseReceipts = <T extends keyof ExpenseDetailTypeMap>(options: {
  apiExpenseData: ApiResourceExpenseDetailsMap[T] | null;
  testExpenseData: ExpenseDetailTypeMap[T];
}) => {
  const apiReceiptMap: Record<string, ApiResourceReceipt> = {};
  options.apiExpenseData?.receipts.forEach((receipt) => {
    apiReceiptMap[receipt.name] = receipt;
  });

  let purchaseId = options.apiExpenseData?.id || options.testExpenseData.id;
  if (!validate(purchaseId)) {
    purchaseId = uuidv4();
  }

  const dataReceipts: ApiResourceReceipt[] = [];
  for (let rct of options.testExpenseData.receipts) {
    if (apiReceiptMap[rct.name]) {
      dataReceipts.push(apiReceiptMap[rct.name]);
    } else {
      cy.fixture(`expenses/${options.testExpenseData.belongsTo}/${rct.name}`, "binary").then((binarystring) => {
        //upload receipt
        let receiptId = rct.id || rct.name;
        if (!validate(receiptId)) {
          receiptId = uuidv4();
        }

        // console.log("binary string", binarystring);
        const dbItem: DbReceiptFileResource = {
          // filedata: filearrabuffer,
          filedata: new ArrayBuffer(),
          id: receiptId,
          name: rct.name,
          createdOn: new Date(),
          relationId: purchaseId,
          belongsTo: options.testExpenseData.belongsTo
        };
        dispatchApiReceiptAdd(dbItem, rct.contentType, binarystring);

        dataReceipts.push({
          id: dbItem.id,
          belongsTo: dbItem.belongsTo,
          contentType: rct.contentType,
          name: dbItem.name,
          relationId: dbItem.relationId
        });
      });
    }
  }
  return cy.wrap(dataReceipts);
};

const dispatchApiExpenseGetById = <T extends keyof ApiResourceExpenseDetailsMap>(belongsTo: T, id?: string | null) => {
  // using workaround to prevent typescript ambiguity compilation error because of null
  const defaultResponse = {} as ApiResourceExpenseDetailsMap[T];
  if (!id) {
    return cy.wrap(defaultResponse);
  }
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return cy
      .indexedDb(IndexedDbName.MockExpense)
      .getItem<ApiResourceExpenseDetailsMap[T]>(id, { storeName: expenseStoreName })
      .then((apiData) => {
        if (apiData) {
          return apiData;
        }
        return defaultResponse;
      });
  }
  // call api
  return cy
    .request<ApiResourceExpenseDetailsMap[T]>({
      method: "GET",
      url: getExpenseUrl(belongsTo) + "/id/" + id,
      headers: {
        Authorization: Cypress.env("accessToken")
      },
      failOnStatusCode: false
    })
    .then((response) => {
      console.log("expense by id, response=", response);
      expect(response.status === 200 || response.status === 404).to.true;
      // expect(response.body).to.an("object");
      if (response.status === 200) {
        return response.body;
      }
      return defaultResponse;
    });
};

const dispatchApiExpenseAddUpdate = (apiExpenseData: UnionApiResourceExpenseDetails, expenseRef: string) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return cy
      .indexedDb(IndexedDbName.MockExpense)
      .updateItems([apiExpenseData], { storeName: expenseStoreName })
      .then((storedExpenseData) => {
        // hard wait to allow api to store the data and processed
        cy.wait(2000);

        cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: expenseStoreName });

        return cy.wrap(storedExpenseData[0]).as(`createdExpense/${apiExpenseData.belongsTo}/${expenseRef}`);
      });
  }
  return cy
    .request({
      method: "POST",
      url: getExpenseUrl(apiExpenseData.belongsTo),
      body: apiExpenseData,
      headers: {
        Authorization: Cypress.env("accessToken")
      }
    })
    .then((response) => {
      console.log("response=", response);
      expect(response.status).to.least(200);
      expect(response.status).to.most(201);
      expect(response.body).to.an("object");
      expect(response.body.id).to.an("string");
      // hard wait to allow api to store the data and processed
      cy.wait(2000);
      cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: expenseStoreName });
      return cy.wrap(response.body as UnionApiResourceExpenseDetails).as(`createdExpense/${apiExpenseData.belongsTo}/${expenseRef}`);
    });
};

const dispatchApiExpenseCount = (pageNum: number, pageMonths: number, belongsTo: ExpenseBelongsTo) => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  const queryParams = {
    pageNo: pageNum,
    status: ExpenseStatus.ENABLE,
    pageMonths: pageMonths,
    belongsTo: belongsTo
  };
  if (!apiBaseUrl) {
    return cy
      .indexedDb(IndexedDbName.MockExpense)
      .getItems<UnionApiResourceExpenseDetails>({ storeName: expenseStoreName, indexName: "item-status-index" }, queryParams.status)
      .then((expenses) => {
        const rangeStartDate = formatTimestamp(addMonths(new Date(), pageMonths * -1 * queryParams.pageNo), expenseDateFormatFixture);
        const rangeEndDate = formatTimestamp(addMonths(new Date(), pageMonths * -1 * (queryParams.pageNo - 1)), expenseDateFormatFixture);

        const filteredExpenses = expenses.filter((expense) => {
          let expenseDate = null;
          if (queryParams.belongsTo === ExpenseBelongsTo.Purchase && expense.belongsTo === ExpenseBelongsTo.Purchase) {
            expenseDate = expense.purchaseDate;
          } else if (queryParams.belongsTo === ExpenseBelongsTo.Income && expense.belongsTo === ExpenseBelongsTo.Income) {
            expenseDate = expense.incomeDate;
          } else if (queryParams.belongsTo === ExpenseBelongsTo.Refund && expense.belongsTo === ExpenseBelongsTo.Refund) {
            expenseDate = expense.refundDate;
          }
          if (!expenseDate) {
            return false;
          }
          return expenseDate >= rangeStartDate && expenseDate <= rangeEndDate;
        });
        return filteredExpenses.length;
      });
  }

  return cy
    .request({
      method: "GET",
      url: `${apiBaseUrl}/expenses/count`,
      qs: queryParams,
      headers: {
        Authorization: Cypress.env("accessToken")
      }
    })
    .then((response) => {
      console.log("response=", response);
      expect(response.status).to.equals(200);
      expect(response.body).to.satisfy((val: any) => !isNaN(Number(val)), "is a valid number");
      return Number(response.body);
    });
};

const verifyAndWaitMore = (
  pageNum: number,
  pageMonths: number,
  belongsTo: ExpenseBelongsTo,
  initialCount: number,
  expenseId: string | null,
  remainingWaitInMillis: number
): Cypress.Chainable<boolean> => {
  if (expenseId) {
    expect(expenseId).to.an(
      "string",
      `${belongsTo} id exists in original data. skipping get count call for update. remainingWaitInMillis: ${remainingWaitInMillis}`
    );
    // update request doesn't need to wait more
    return cy.wrap(true);
  }
  if (remainingWaitInMillis < 0) {
    const errorMessage = `exceeded maximum given wait, the initial expense count [${initialCount}] is not increased after add.`;
    cy.log("ERROR:" + errorMessage);
    throw new Error(errorMessage);
  }
  // add request needs to be wait more if count is not increased from initial count
  return dispatchApiExpenseCount(pageNum, pageMonths, belongsTo).then((newCount) => {
    if (newCount === initialCount) {
      const waitInMillis = 20 * 1000;
      cy.log(`retrying get count api call and verify after ${waitInMillis} millis. remainingWaitInMillis: ${remainingWaitInMillis}`);
      return cy
        .wait(waitInMillis)
        .then(() => verifyAndWaitMore(pageNum, pageMonths, belongsTo, initialCount, expenseId, remainingWaitInMillis - waitInMillis));
    }

    expect(newCount).to.be.greaterThan(initialCount, `found proper count for add ${belongsTo} call. remainingWaitInMillis: ${remainingWaitInMillis}`);
    return cy.wrap(true);
  });
};

interface ExpenseAddUpdatePrepareType<T extends keyof ApiResourceExpenseDetailsMap> {
  expenseApiData: ApiResourceExpenseDetailsMap[T] | null;
  expenseReceipts: ApiResourceReceipt[];
  paymentAccountData: PaymentAccountDetailType;
  currencyProfileData: ApiCurrencyProfileResource;
}
const prepareExpenseData = <T extends keyof ExpenseDetailTypeMap>(belongsTo: T, expenseData: ExpenseDetailTypeMap[T]) => {
  dispatchApiExpenseGetById(belongsTo, expenseData.id).then((expenseApiDataOrDefault) => {
    const expenseApiData = expenseApiDataOrDefault.belongsTo === belongsTo ? expenseApiDataOrDefault : null;
    prepareExpenseReceipts({ apiExpenseData: expenseApiData, testExpenseData: expenseData }).then((expenseReceipts) => {
      getPaymentAccount(expenseData.paymentAccountRef).then((paymentAccountData) => {
        cy.getCurrencyProfile().then((currencyProfileData) => {
          const result: ExpenseAddUpdatePrepareType<T> = {
            expenseApiData,
            expenseReceipts,
            paymentAccountData,
            currencyProfileData
          };
          return cy.wrap(result).as("expenseAddUpdate");
        });
      });
    });
  });
  return cy.get("@expenseAddUpdate").then((data: any) => {
    return data as ExpenseAddUpdatePrepareType<T>;
  });
};

const createOrUpdateExpensePurchaseViaApi = (purchaseData: ExpensePurchaseDetailType, status: ExpenseStatus) => {
  prepareExpenseData(ExpenseBelongsTo.Purchase, purchaseData).then((purchaseAddUpdateData) => {
    const purchaseTypeRefs = [purchaseData.purchaseTypeRef];
    purchaseData.items.forEach((pi) => {
      if (pi.purchaseTypeRef) {
        purchaseTypeRefs.push(pi.purchaseTypeRef);
      }
    });
    getPurchaseTypeList(purchaseTypeRefs).then((purchaseTypeDataList) => {
      const purchaseTypeDataMapByRef: Record<string, ConfigDetailType> = {};
      purchaseTypeDataList.forEach((ptd) => {
        purchaseTypeDataMapByRef[ptd.ref] = ptd;
      });
      getPaymentAccount(purchaseData.paymentAccountRef).then((paymentAccountFixtureData) => {
        // dispatchApiExpenseCount(1, 12, ExpenseBelongsTo.Purchase).then((initialCount) => {
        const purchaseId =
          purchaseAddUpdateData.expenseReceipts[0]?.relationId || purchaseAddUpdateData.expenseApiData?.id || purchaseData.id || uuidv4();
        let verifiedTimestamp: string | undefined = undefined;
        if (purchaseData.verifiedTimestamp) {
          verifiedTimestamp = formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateTimestampFormatApi);
        }

        const paymentAccountId = paymentAccountFixtureData.id || purchaseAddUpdateData.paymentAccountData.id;
        if (!paymentAccountId) {
          throw new Error("payment account id is not found. ");
        }

        if (!purchaseTypeDataMapByRef[purchaseData.purchaseTypeRef]?.id) {
          throw new Error("purchaseType id is not found");
        }

        const purchaseItems: ApiResourcePurchaseItemDetails[] = purchaseData.items.map((pfi, ind) => {
          return {
            id: pfi.id || `item-${ind}`,
            amount: pfi.amount,
            billName: pfi.billName,
            description: pfi.description,
            tags: pfi.tags || [],
            purchaseTypeId: purchaseTypeDataMapByRef[pfi.purchaseTypeRef]?.id
          };
        });

        const apiPurchaseData: ApiResourcePurchaseDetails = {
          id: purchaseId,
          belongsTo: ExpenseBelongsTo.Purchase,
          billName: purchaseData.billName,
          amount: purchaseData.amount,
          purchaseDate: formatTimestamp(parseTimestamp(purchaseData.purchaseDate, expenseDateFormatFixture), dateTimestampFormatApi),
          description: purchaseData.description,
          profileId: purchaseAddUpdateData.currencyProfileData.id,
          purchaseTypeId: purchaseTypeDataMapByRef[purchaseData.purchaseTypeRef].id,
          status: status,
          items: purchaseItems,
          personIds: [],
          receipts: purchaseAddUpdateData.expenseReceipts,
          tags: purchaseData.tags,
          paymentAccountId: paymentAccountId,
          verifiedTimestamp: verifiedTimestamp,
          auditDetails: {
            createdOn: purchaseAddUpdateData.expenseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
            updatedOn: purchaseAddUpdateData.expenseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
          }
        };
        dispatchApiExpenseAddUpdate(apiPurchaseData, purchaseData.ref); /* .then((updatedApiPurchase) => {
            verifyAndWaitMore(
              1,
              12,
              ExpenseBelongsTo.Purchase,
              initialCount,
              purchaseAddUpdateData.expenseApiData?.id || purchaseData.id || null,
              maxWaitInMillis
            );
          }); */
        // });
      });
    });
  });
};

const createOrUpdateExpenseIncomeViaApi = (incomeData: ExpenseIncomeDetailType, status: ExpenseStatus) => {
  prepareExpenseData(ExpenseBelongsTo.Income, incomeData).then((incomeAddUpdateData) => {
    getIncomeType(incomeData.incomeTypeRef).then((incomeTypeData) => {
      getPaymentAccount(incomeData.paymentAccountRef).then((paymentAccountFixtureData) => {
        // dispatchApiExpenseCount(1, 12, ExpenseBelongsTo.Income).then((initialCount) => {
        const incomeId = incomeAddUpdateData.expenseReceipts[0]?.relationId || incomeAddUpdateData.expenseApiData?.id || incomeData.id || uuidv4();

        const paymentAccountId = paymentAccountFixtureData.id || incomeAddUpdateData.paymentAccountData.id;
        if (!paymentAccountId) {
          throw new Error("payment account id is not found. ");
        }
        if (!incomeTypeData?.id) {
          throw new Error("incomeType id is not found");
        }

        const apiIncomeData: ApiResourceIncomeDetails = {
          id: incomeId,
          belongsTo: ExpenseBelongsTo.Income,
          billName: incomeData.billName,
          amount: incomeData.amount,
          incomeDate: formatTimestamp(parseTimestamp(incomeData.incomeDate, expenseDateFormatFixture), dateTimestampFormatApi),
          description: incomeData.description,
          profileId: incomeAddUpdateData.currencyProfileData.id,
          incomeTypeId: incomeTypeData.id,
          status: status,
          personIds: [],
          receipts: incomeAddUpdateData.expenseReceipts,
          tags: incomeData.tags,
          paymentAccountId: paymentAccountId,
          auditDetails: {
            createdOn: incomeAddUpdateData.expenseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
            updatedOn: incomeAddUpdateData.expenseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
          }
        };
        dispatchApiExpenseAddUpdate(apiIncomeData, incomeData.ref); /* .then((updatedApiIncome) => {
            verifyAndWaitMore(
              1,
              12,
              ExpenseBelongsTo.Income,
              initialCount,
              incomeAddUpdateData.expenseApiData?.id || incomeData.id || null,
              maxWaitInMillis
            );
          }); */
        // });
      });
    });
  });
};

const createOrUpdateExpenseRefundViaApi = (refundData: ExpenseRefundDetailType, status: ExpenseStatus) => {
  prepareExpenseData(ExpenseBelongsTo.Refund, refundData).then((refundAddUpdateData) => {
    getRefundReason(refundData.reasonRef).then((reasonData) => {
      getPaymentAccount(refundData.paymentAccountRef).then((paymentAccountFixtureData) => {
        if (refundData.purchaseRef && !refundData.purchaseId) {
          createOrUpdateExpensePurchase(refundData.purchaseRef, status);
        } else {
          cy.wrap({ id: refundData.purchaseId }).as(`createdExpense/${ExpenseBelongsTo.Purchase}/${refundData.purchaseRef}`);
        }

        const paymentAccountId = paymentAccountFixtureData.id || refundAddUpdateData.paymentAccountData.id;
        if (!paymentAccountId) {
          throw new Error("payment account id is not found. ");
        }
        if (!reasonData?.id) {
          throw new Error("refund reason id is not found");
        }

        cy.get(`@createdExpense/${ExpenseBelongsTo.Purchase}/${refundData.purchaseRef}`).then((data: any) => {
          const createdPurchaseData = data as ExpensePurchaseDetailType;
          // dispatchApiExpenseCount(1, 12, ExpenseBelongsTo.Refund).then((initialCount) => {
          const refundId = refundAddUpdateData.expenseReceipts[0]?.relationId || refundAddUpdateData.expenseApiData?.id || refundData.id || uuidv4();
          const purchaseId = refundData.purchaseRef ? refundData.purchaseId || createdPurchaseData.id : undefined;

          const apiRefundData: ApiResourceRefundDetails = {
            id: refundId,
            belongsTo: ExpenseBelongsTo.Refund,
            billName: refundData.billName,
            amount: refundData.amount,
            refundDate: formatTimestamp(parseTimestamp(refundData.refundDate, expenseDateFormatFixture), dateTimestampFormatApi),
            description: refundData.description,
            profileId: refundAddUpdateData.currencyProfileData.id,
            reasonId: reasonData.id,
            status: status,
            personIds: [],
            receipts: refundAddUpdateData.expenseReceipts,
            tags: refundData.tags,
            paymentAccountId: refundAddUpdateData.paymentAccountData.id,
            purchaseId: purchaseId,
            auditDetails: {
              createdOn: refundAddUpdateData.expenseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
              updatedOn: refundAddUpdateData.expenseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
            }
          };
          dispatchApiExpenseAddUpdate(apiRefundData, refundData.ref).then((updatedApiRefund) => {
            if (purchaseId) {
              updateExpenseRefund({ ...refundData, purchaseId: purchaseId });
            }
            /* verifyAndWaitMore(
                1,
                12,
                ExpenseBelongsTo.Refund,
                initialCount,
                refundAddUpdateData.expenseApiData?.id || refundData.id || null,
                maxWaitInMillis
              ); */
          });
          // });
        });
      });
    });
  });
};

export const createOrUpdateExpensePurchase = (purchaseRef: string, status: ExpenseStatus) => {
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    console.log("purchaseData=", { ...purchaseData });
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
    createOrUpdatePurchaseType({ ref: purchaseData.purchaseTypeRef, status: "enable" });
    const purchaseItemRefs: string[] = purchaseData.items
      .map((pi) => pi.purchaseTypeRef as string)
      .filter((prchItmRef) => !!prchItmRef && prchItmRef !== purchaseData.purchaseTypeRef);
    for (let purchaseTypeRef of purchaseItemRefs) {
      createOrUpdatePurchaseType({ ref: purchaseTypeRef, status: "enable" });
    }
    createOrUpdateExpensePurchaseViaApi(purchaseData, status);
  });
};

export const createOrUpdateExpenseIncome = (incomeRef: string, status: ExpenseStatus) => {
  getExpenseIncome(incomeRef).then((incomeData) => {
    console.log("income Data=", { ...incomeData });
    createOrUpdatePaymentAccount([{ ref: incomeData.paymentAccountRef, status: "enable" }]);
    createOrUpdateIncomeType({ ref: incomeData.incomeTypeRef, status: "enable" });
    createOrUpdateExpenseIncomeViaApi(incomeData, status);
  });
};

export const createOrUpdateExpenseRefund = (refundRef: string, status: ExpenseStatus) => {
  getExpenseRefund(refundRef).then((refundData) => {
    console.log("refund Data=", { ...refundData });
    createOrUpdatePaymentAccount([{ ref: refundData.paymentAccountRef, status: "enable" }]);
    createOrUpdateRefundReason({ ref: refundData.reasonRef, status: "enable" });
    if (refundData.purchaseRef) {
      createOrUpdateExpensePurchase(refundData.purchaseRef, ExpenseStatus.ENABLE);
    }
    createOrUpdateExpenseRefundViaApi(refundData, status);
  });
};
