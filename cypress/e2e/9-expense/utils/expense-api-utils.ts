import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import {
  ApiCurrencyProfileResource,
  ApiResourceIncomeDetails,
  ApiResourcePurchaseDetails,
  ApiResourceReceipt,
  ApiResourceRefundDetails,
  ExpenseBelongsTo,
  ExpenseStatus,
  ReceiptContentType
} from "../../../support/api-resource-types";
import { dateTimestampFormatApi, expenseDateFormatFixture, formatTimestamp, parseTimestamp } from "../../../support/date-utils";
import { getIncomeType, getPurchaseType, getRefundReason } from "../../../support/fixture-utils/read-config-type";
import { ExpensePurchaseDetailType, getExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";
import { getPaymentAccount, PaymentAccountDetailType } from "../../../support/fixture-utils/read-payment-account";
import { createOrUpdatePaymentAccount } from "../../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdateIncomeType, createOrUpdatePurchaseType, createOrUpdateRefundReason } from "../../9-settings/utils/config-type-utils";
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
    cy.indexedDb(IndexedDbName.MockExpense).updateItems([apiExpenseData], { storeName: expenseStoreName });
  } else {
    cy.request({
      method: "POST",
      url: getExpenseUrl(apiExpenseData.belongsTo),
      body: apiExpenseData,
      headers: {
        Authorization: Cypress.env("accessToken")
      }
    }).then((response) => {
      console.log("response=", response);
      expect(response.status).to.least(200);
      expect(response.status).to.most(201);
      expect(response.body).to.an("object");
    });
  }
  cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: expenseStoreName });
  cy.wrap(apiExpenseData).as(`createdExpense/${apiExpenseData.belongsTo}/${expenseRef}`);
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
    getPurchaseType(purchaseData.purchaseTypeRef).then((purchaseTypeData) => {
      const purchaseId =
        purchaseAddUpdateData.expenseReceipts[0]?.relationId || purchaseAddUpdateData.expenseApiData?.id || purchaseData.id || uuidv4();
      let verifiedTimestamp: string | undefined = undefined;
      if (purchaseData.verifiedTimestamp) {
        verifiedTimestamp = formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateTimestampFormatApi);
      }
      const apiPurchaseData: ApiResourcePurchaseDetails = {
        id: purchaseId,
        belongsTo: ExpenseBelongsTo.Purchase,
        billName: purchaseData.billName,
        amount: purchaseData.amount,
        purchaseDate: formatTimestamp(parseTimestamp(purchaseData.purchaseDate, expenseDateFormatFixture), dateTimestampFormatApi),
        description: purchaseData.description,
        profileId: purchaseAddUpdateData.currencyProfileData.id,
        purchaseTypeId: purchaseTypeData?.id!,
        status: status,
        items: purchaseData.items,
        personIds: [],
        receipts: purchaseAddUpdateData.expenseReceipts,
        tags: purchaseData.tags,
        paymentAccountId: purchaseAddUpdateData.paymentAccountData.id,
        verifiedTimestamp: verifiedTimestamp,
        auditDetails: {
          createdOn: purchaseAddUpdateData.expenseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
          updatedOn: purchaseAddUpdateData.expenseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
        }
      };
      dispatchApiExpenseAddUpdate(apiPurchaseData, purchaseData.ref);
    });
  });
};

const createOrUpdateExpenseIncomeViaApi = (incomeData: ExpenseIncomeDetailType, status: ExpenseStatus) => {
  prepareExpenseData(ExpenseBelongsTo.Income, incomeData).then((incomeAddUpdateData) => {
    getIncomeType(incomeData.incomeTypeRef).then((incomeTypeData) => {
      const incomeId = incomeAddUpdateData.expenseReceipts[0]?.relationId || incomeAddUpdateData.expenseApiData?.id || incomeData.id || uuidv4();

      const apiIncomeData: ApiResourceIncomeDetails = {
        id: incomeId,
        belongsTo: ExpenseBelongsTo.Income,
        billName: incomeData.billName,
        amount: incomeData.amount,
        incomeDate: formatTimestamp(parseTimestamp(incomeData.incomeDate, expenseDateFormatFixture), dateTimestampFormatApi),
        description: incomeData.description,
        profileId: incomeAddUpdateData.currencyProfileData.id,
        incomeTypeId: incomeTypeData?.id!,
        status: status,
        personIds: [],
        receipts: incomeAddUpdateData.expenseReceipts,
        tags: incomeData.tags,
        paymentAccountId: incomeAddUpdateData.paymentAccountData.id,
        auditDetails: {
          createdOn: incomeAddUpdateData.expenseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
          updatedOn: incomeAddUpdateData.expenseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
        }
      };
      dispatchApiExpenseAddUpdate(apiIncomeData, incomeData.ref);
    });
  });
};

const createOrUpdateExpenseRefundViaApi = (refundData: ExpenseRefundDetailType, status: ExpenseStatus) => {
  prepareExpenseData(ExpenseBelongsTo.Refund, refundData).then((refundAddUpdateData) => {
    getRefundReason(refundData.reasonRef).then((reasonData) => {
      if (refundData.purchaseRef && !refundData.purchaseId) {
        createOrUpdateExpensePurchase(refundData.purchaseRef, status);
      } else {
        cy.wrap({ id: refundData.purchaseId }).as(`createdExpense/${ExpenseBelongsTo.Purchase}/${refundData.purchaseRef}`);
      }

      cy.get(`@createdExpense/${ExpenseBelongsTo.Purchase}/${refundData.purchaseRef}`).then((data: any) => {
        const createdPurchaseData = data as ExpensePurchaseDetailType;
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
          reasonId: reasonData?.id!,
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
        dispatchApiExpenseAddUpdate(apiRefundData, refundData.ref);
        if (purchaseId) {
          updateExpenseRefund({ ...refundData, purchaseId: purchaseId });
        }
      });
    });
  });
};

export const createOrUpdateExpensePurchase = (purchaseRef: string, status: ExpenseStatus) => {
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    console.log("purchaseData=", purchaseData);
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
    createOrUpdatePurchaseType({ ref: purchaseData.purchaseTypeRef, status: "enable" });
    createOrUpdateExpensePurchaseViaApi(purchaseData, status);
  });
};

export const createOrUpdateExpenseIncome = (incomeRef: string, status: ExpenseStatus) => {
  getExpenseIncome(incomeRef).then((incomeData) => {
    console.log("income Data=", incomeData);
    createOrUpdatePaymentAccount([{ ref: incomeData.paymentAccountRef, status: "enable" }]);
    createOrUpdateIncomeType({ ref: incomeData.incomeTypeRef, status: "enable" });
    createOrUpdateExpenseIncomeViaApi(incomeData, status);
  });
};

export const createOrUpdateExpenseRefund = (refundRef: string, status: ExpenseStatus) => {
  getExpenseRefund(refundRef).then((refundData) => {
    console.log("refund Data=", refundData);
    createOrUpdatePaymentAccount([{ ref: refundData.paymentAccountRef, status: "enable" }]);
    createOrUpdateRefundReason({ ref: refundData.reasonRef, status: "enable" });
    if (refundData.purchaseRef) {
      createOrUpdateExpensePurchase(refundData.purchaseRef, ExpenseStatus.ENABLE);
    }
    createOrUpdateExpenseRefundViaApi(refundData, status);
  });
};
