import { IndexedDbName } from "../../../plugins/indexedDb/resource";
import { ApiResourcePurchaseDetails, ApiResourceReceipt, ExpenseBelongsTo, ExpenseStatus } from "../../../support/api-resource-types";
import { dateTimestampFormatApi, formatTimestamp, parseTimestamp, purchaseDateFormatFixture } from "../../../support/date-utils";
import { getPurchaseType } from "../../../support/fixture-utils/read-config-type";
import { ExpensePurchaseDetailType, getExpensePurchase } from "../../../support/fixture-utils/read-expense-purchase";
import { getPaymentAccount } from "../../../support/fixture-utils/read-payment-account";
import { createOrUpdatePaymentAccount } from "../../9-payment-accounts/utils/payment-account-api-utils";
import { createOrUpdatePurchaseType } from "../../9-settings/utils/config-type-utils";
import { v4 as uuidv4, validate } from "uuid";

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

const prepareExpenseReceipts = (options: { apiPurchaseData: ApiResourcePurchaseDetails | null; testPurchaseData: ExpensePurchaseDetailType }) => {
  const apiReceiptMap: Record<string, ApiResourceReceipt> = {};
  options.apiPurchaseData?.receipts.forEach((receipt) => {
    apiReceiptMap[receipt.name] = receipt;
  });

  const apiBaseUrl = Cypress.env("API_BASE_URL");
  let purchaseId = options.apiPurchaseData?.id || options.testPurchaseData.id;
  if (!validate(purchaseId)) {
    purchaseId = uuidv4();
  }

  const dataReceipts: ApiResourceReceipt[] = [];
  for (let rct of options.testPurchaseData.receipts) {
    if (apiReceiptMap[rct.name]) {
      dataReceipts.push(apiReceiptMap[rct.name]);
    } else {
      cy.fixture(`expenses/purchase/${rct.name}`, "binary").then((binaryfile) => {
        //upload receipt
        let receiptId = rct.id || rct.name;
        if (!validate(receiptId)) {
          receiptId = uuidv4();
        }
        if (!apiBaseUrl) {
          const filearrabuffer = Cypress.Blob.binaryStringToArrayBuffer(binaryfile);
          const dbItem: DbReceiptFileResource = {
            filedata: filearrabuffer,
            id: receiptId,
            name: rct.name,
            createdOn: new Date(),
            relationId: purchaseId,
            belongsTo: ExpenseBelongsTo.Purchase
          };
          cy.indexedDb(IndexedDbName.MockExpense).updateItems([dbItem], { storeName: receiptStoreName });
          dataReceipts.push({
            id: dbItem.id,
            belongsTo: dbItem.belongsTo,
            contentType: rct.contentType,
            name: dbItem.name,
            relationId: dbItem.relationId
          });
        }
      });
    }
  }
  return cy.wrap(dataReceipts);
};

const createOrUpdateExpensePurchaseViaApi = (purchaseData: ExpensePurchaseDetailType, status: ExpenseStatus) => {
  // console.log("purchase data", purchaseData, "and status", status);
  getExpensePurchaseViaApi(purchaseData.id).then((purchaseApiData) => {
    // console.log("retrieved purchase data from api", purchaseApiData);
    prepareExpenseReceipts({ apiPurchaseData: purchaseApiData, testPurchaseData: purchaseData }).then((purchaseReceipts) => {
      // console.log("prepared purchase receipt data", purchaseReceipts);
      getPaymentAccount(purchaseData.paymentAccountRef).then((paymentAccountData) => {
        // console.log("retrieved purchase data", paymentAccountData);
        getPurchaseType(purchaseData.purchaseTypeRef).then((purchaseTypeData) => {
          // console.log("retrieved purchase type", purchaseTypeData);
          cy.getCurrencyProfile().then((currencyProfileData) => {
            // console.log("retrieved currency profile", currencyProfileData);
            // console.log("gathered all details. preparing api resource");
            const purchaseId = purchaseReceipts[0]?.relationId || purchaseApiData?.id || purchaseData.id;
            let verifiedTimestamp: string | undefined = undefined;
            if (purchaseData.verifiedTimestamp) {
              verifiedTimestamp = formatTimestamp(parseTimestamp(purchaseData.verifiedTimestamp), dateTimestampFormatApi);
            }
            const apiPurchaseData: ApiResourcePurchaseDetails = {
              id: purchaseId,
              belongsTo: ExpenseBelongsTo.Purchase,
              billName: purchaseData.billName,
              amount: purchaseData.amount,
              purchaseDate: formatTimestamp(parseTimestamp(purchaseData.purchaseDate, purchaseDateFormatFixture), dateTimestampFormatApi),
              description: purchaseData.description,
              profileId: currencyProfileData.id,
              purchaseTypeId: purchaseTypeData?.id!,
              status: status,
              items: purchaseData.items,
              personIds: [],
              receipts: purchaseReceipts,
              tags: purchaseData.tags,
              paymentAccountId: paymentAccountData.id,
              verifiedTimestamp: verifiedTimestamp,
              auditDetails: {
                createdOn: purchaseApiData?.auditDetails.createdOn || formatTimestamp(new Date(), dateTimestampFormatApi),
                updatedOn: purchaseApiData?.auditDetails.updatedOn || formatTimestamp(new Date(), dateTimestampFormatApi)
              }
            };

            const apiBaseUrl = Cypress.env("API_BASE_URL");
            if (!apiBaseUrl) {
              cy.indexedDb(IndexedDbName.MockExpense).updateItems([apiPurchaseData], { storeName: expenseStoreName });
              cy.indexedDb(IndexedDbName.Expense).clearStore({ storeName: expenseStoreName });
            }
          });
        });
      });
    });
  });
};

const getExpensePurchaseViaApi = (purchaseId?: string) => {
  if (!purchaseId) {
    return cy.wrap(null);
  }
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  if (!apiBaseUrl) {
    return cy.indexedDb(IndexedDbName.MockExpense).getItem<ApiResourcePurchaseDetails>(purchaseId, { storeName: expenseStoreName });
  }
  // call api
  return cy.wrap(null);
};

export const createOrUpdateExpensePurchase = (purchaseRef: string, status: ExpenseStatus) => {
  getExpensePurchase(purchaseRef).then((purchaseData) => {
    console.log("purchaseData=", purchaseData);
    createOrUpdatePaymentAccount([{ ref: purchaseData.paymentAccountRef, status: "enable" }]);
    createOrUpdatePurchaseType({ ref: purchaseData.purchaseTypeRef, status: "enable" });
    createOrUpdateExpensePurchaseViaApi(purchaseData, status);
  });
};
