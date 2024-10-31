import { v4 as uuidv4 } from "uuid";
import datetime from "date-and-time";
import { PurchaseFields, PurchaseItemFields, ExpenseStatus } from "../../pages/expenses";
import { LoggerBase, ObjectDeepDifference, formatTimestamp, getDateInstance, getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { auditData } from "../services/userDetails";
import { deleteReceiptFileData, updatePurchaseIdForReceipt } from "./receipts-db";
import { getDefaultCurrencyProfileId, getPurchaseTypes } from "./config-type-db";
import { getPymtAccountList } from "./pymt-acc-db";
import { ExpenseBelongsTo } from "../../pages/expenses/services";
import { ExpenseFilter } from "./expense-db";
import { ReceiptProps } from "../../components/receipt";
import { JSONObject } from "../../shared/utils/deep-obj-difference";

const purchaseDb = new MyLocalDatabase<PurchaseFields>(LocalDBStore.Expense);
const _rootLogger = getLogger("mock.db.expense.purchase", null, null, "DISABLED");

// initialize on page load
const init = async () => {
  const logger = getLogger("init", _rootLogger);

  const purchaseTypes = (await getPurchaseTypes()).list;
  logger.debug("retrieved", purchaseTypes.length, "purchase types");

  const typeId = (typeName: string) => {
    return purchaseTypes.find((prchtyp) => prchtyp.value === typeName)?.id;
  };

  const paymentAccounts = (await getPymtAccountList()).list;
  logger.debug("retrieved", paymentAccounts.length, "payment accounts");
  const pymtAccId = (accname: string) => {
    return paymentAccounts.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id;
  };

  const purchases = await purchaseDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.Purchase);
  logger.debug("retrieved", purchases.length, "purchases");

  if (purchases.length > 0) {
    return;
  }

  const currencyProfileId = await getDefaultCurrencyProfileId();

  logger.debug("creating sample purchases");
  await purchaseDb.addItem({
    id: uuidv4(),
    billName: "burger restaurant",
    amount: "21.20",
    description: "this is dummy expense for demo purpose",
    tags: "outdoor,dining,trip".split(","),
    paymentAccountId: pymtAccId("checking"),
    purchaseDate: formatTimestamp(datetime.addDays(new Date(), -10)),
    purchaseTypeId: typeId("hangout"),
    receipts: [],
    items: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    belongsTo: ExpenseBelongsTo.Purchase,
    personIds: [],
    currencyProfileId: currencyProfileId,
  });

  await purchaseDb.addItem({
    id: uuidv4(),
    billName: "grocery store",
    amount: "63.80",
    description: "this is dummy expense for demo purpose",
    tags: "get2gethor,potluck".split(","),
    paymentAccountId: pymtAccId("cash"),
    purchaseDate: formatTimestamp(datetime.addDays(new Date(), -3)),
    purchaseTypeId: typeId("food shopping"),
    verifiedTimestamp: formatTimestamp(datetime.addHours(new Date(), -1)),
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    belongsTo: ExpenseBelongsTo.Purchase,
    personIds: [],
    currencyProfileId: currencyProfileId,
    items: [
      {
        id: uuidv4(),
        billName: "snacks",
        amount: "14.34",
        tags: "kids,breaktime,hangout".split(","),
        description: "for breakfast, break time during play or evening hangout",
        purchaseTypeId: typeId("hangout"),
      },
      {
        id: uuidv4(),
        billName: "breakfast",
        amount: "8.7",
        tags: "breakfast,dairy".split(","),
        description: "milk, bread, butter, jaam",
      },
      {
        id: uuidv4(),
        billName: "non stick pan",
        amount: "39.7",
        tags: "utensil,kitchen".split(","),
        purchaseTypeId: typeId("home stuffs"),
        description: "",
      },
    ],
  });
};

await init();

export type PurchaseFilter = ExpenseFilter;

export const getPurchaseTags = async (purchasedYears: number[]) => {
  const logger = getLogger("getPurchaseTags", _rootLogger);

  const purchaseList = await purchaseDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.Purchase);
  logger.debug("retrieved", purchaseList.length, "purchase. now filtering by purchase year");

  logger.debug("purchasedYears =", purchasedYears, ", purchasedYearRanges =", purchasedYears);
  const taglist = purchaseList
    .filter((pi) => {
      const purchasedYear = getDateInstance(pi.purchaseDate).getFullYear();
      return purchasedYears.includes(purchasedYear);
    })
    .flatMap((pi) => [...pi.tags, ...(pi.items?.flatMap((pii) => pii.tags) || [])]);

  return { list: taglist };
};

export const getPurchaseDetails = async (purchaseId: string) => {
  const existingPurchase = await purchaseDb.getItem(purchaseId);
  if (existingPurchase && existingPurchase.belongsTo === ExpenseBelongsTo.Purchase) {
    const details: PurchaseFields = {
      ...existingPurchase,
    };
    return { getDetails: details };
  }
  return { error: "purchase not found" };
};

const getReceiptsForPurchaseAddUpdate = async (
  oldPurchaseReceipts: ReceiptProps[],
  newPurchaseReceipts: ReceiptProps[],
  oldPurchaseId: string,
  newPurchaseId: string,
  logger: LoggerBase
) => {
  const existingPurchaseReceipts = oldPurchaseReceipts.reduce((obj: Record<string, ReceiptProps>, r) => {
    obj[r.id] = r;
    return obj;
  }, {});
  const noChangeExistingReceipts = newPurchaseReceipts.map((r) => existingPurchaseReceipts[r.id]).filter((r) => r);

  const addedNewReceiptPromises = newPurchaseReceipts
    .filter((r) => !existingPurchaseReceipts[r.id])
    .map(async (r) => {
      const receiptIdResult = await updatePurchaseIdForReceipt(newPurchaseId, oldPurchaseId, r.name);
      if (receiptIdResult.error) {
        return { ...r, error: receiptIdResult.error };
      }
      const rr: ReceiptProps = { ...r, relationId: "", id: receiptIdResult.id as string, url: "", file: undefined };
      return rr;
    });
  const addedNewReceipts = await Promise.all(addedNewReceiptPromises);
  const errorReceipt = addedNewReceipts.find((r) => "error" in r);
  if (errorReceipt) {
    return { error: "invalid receipt" };
  }

  const newExpenseReceiptIds = newPurchaseReceipts.map((r) => r.id);
  const removingExistingReceipts = oldPurchaseReceipts.filter((r) => !newExpenseReceiptIds.includes(r.id));
  const removingPromises = removingExistingReceipts.map(async (r) => {
    return await deleteReceiptFileData(oldPurchaseId, r.id);
  });
  const removingResults = await Promise.all(removingPromises);
  logger.log(
    "removed receipts. ",
    removingResults.filter((r) => r.deleted).flatMap((r) => r)
  );
  logger.warn(
    "failed to removed receipts. errros: ",
    removingResults.filter((r) => r.error)
  );

  return { list: [...noChangeExistingReceipts, ...addedNewReceipts] };
};

export const addUpdatePurchase = async (data: PurchaseFields) => {
  const logger = getLogger("addUpdate", _rootLogger);
  const existingPurchase = await purchaseDb.getItem(data.id);

  if (existingPurchase) {
    logger.info(
      "updating existing expense found. difference (data-existingPurchase) =",
      ObjectDeepDifference(data as unknown as JSONObject, existingPurchase as unknown as JSONObject)
    );
    const receiptResult = await getReceiptsForPurchaseAddUpdate(
      existingPurchase.receipts,
      data.receipts,
      existingPurchase.id,
      existingPurchase.id,
      logger
    );
    if (receiptResult.error) {
      return { error: receiptResult.error };
    }

    const existingPurchaseItems = (existingPurchase.items || []).reduce((obj: Record<string, PurchaseItemFields>, ei) => {
      obj[ei.id] = ei;
      return obj;
    }, {});
    const purchaseItems = data.items || [];
    const updatedExistingPurchaseIems = purchaseItems
      .filter((ei) => existingPurchaseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined }));
    const addedNewPurchaseIems = purchaseItems
      .filter((ei) => !existingPurchaseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() }));

    const updatedPurchase: PurchaseFields = {
      ...data,
      status: ExpenseStatus.Enable,
      receipts: receiptResult.list || [],
      items: [...updatedExistingPurchaseIems, ...addedNewPurchaseIems],
      auditDetails: auditData(existingPurchase.auditDetails.createdBy, existingPurchase.auditDetails.createdOn),
      currencyProfileId: await getDefaultCurrencyProfileId(),
    };
    delete updatedPurchase.purchaseTypeName;
    delete updatedPurchase.paymentAccountName;
    await purchaseDb.addUpdateItem(updatedPurchase);
    return { updated: updatedPurchase };
  }

  const newPurchaseId = uuidv4();
  const receiptResult = await getReceiptsForPurchaseAddUpdate([], data.receipts, data.id, newPurchaseId, logger);
  if (receiptResult.error) {
    return { error: receiptResult.error };
  }
  const addedPurchase: PurchaseFields = {
    ...data,
    id: newPurchaseId,
    status: ExpenseStatus.Enable,
    receipts: data.receipts.map((r) => ({ ...r, id: uuidv4(), relationId: "", url: "" })),
    items: data.items?.map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() })) || [],
    auditDetails: auditData(),
    currencyProfileId: await getDefaultCurrencyProfileId(),
  };

  await purchaseDb.addUpdateItem(addedPurchase);
  return { added: addedPurchase };
};

export const deletePurchase = async (purchaseId: string) => {
  const existingPurchase = await purchaseDb.getItem(purchaseId);
  if (existingPurchase && existingPurchase.belongsTo === ExpenseBelongsTo.Purchase) {
    const deletingPurchase = {
      ...existingPurchase,
      status: ExpenseStatus.Deleted,
      auditDetails: auditData(existingPurchase.auditDetails.createdBy, existingPurchase.auditDetails.createdOn),
    };
    await purchaseDb.addUpdateItem(deletingPurchase);
    return { deleted: { ...deletingPurchase } as PurchaseFields };
  }
  return { error: "purchase not found" };
};
