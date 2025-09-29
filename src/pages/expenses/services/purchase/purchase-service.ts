import {
  axios,
  convertAuditFieldsToDateInstance,
  handleRestErrors,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LoggerBase,
  getDefaultIfError,
  ConfigTypeStatus,
  TagsService,
  TagBelongsTo,
  InvalidError,
  isUuid,
  TagQueryParams,
  getCacheOption,
  getDateInstance,
  getDateString,
  subtractDatesDefaultToZero,
  getDateInstanceDefaultNewDate,
  apiUtils,
  sleep
} from "../../../../shared";
import { PurchaseTypeService } from "./purchase-type-service";
import { pymtAccountService } from "../../../pymt-accounts";
import pMemoize, { pMemoizeClear } from "p-memoize";
import { ExpenseBelongsTo, ExpenseFields } from "../expense/field-types";
import { CacheAction, ReceiptProps } from "../../../../components/receipt";
import { PurchaseFields, PurchaseItemFields } from "./field-types";
import { cacheReceiptFile } from "../receipt/receipt-service";
import { StatBelongsTo, statService } from "../../../home/services";

const purchaseDb = new MyLocalDatabase<PurchaseFields>(LocalDBStore.Expense);
const purchaseTypeService = PurchaseTypeService();
const tagService = TagsService(TagBelongsTo.Purchase);

const rootPath = "/expenses/purchase";
const rootLogger = getLogger("service.expense.purchase", null, null, "DISABLED");

const getPurchaseTypeEnum = async () => {
  const logger = getLogger("getPurchaseTypeEnum", rootLogger);
  const startTime = new Date();
  logger.info("cache miss. calling service to get purchase types");
  const types = await getDefaultIfError(purchaseTypeService.getTypes, []);
  const typeMap = new Map<string, string>();
  types.forEach((ctg) => {
    typeMap.set(ctg.id, ctg.value);
    typeMap.set(ctg.value, ctg.id);
  });
  logger.info("transformed to type Map, ", typeMap, ", execution Time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
  return typeMap;
};

const getDeletedPurchaseTypeEnum = async () => {
  const logger = getLogger("getDeletedPurchaseTypeEnum", rootLogger);
  const startTime = new Date();
  logger.info("cache miss. calling service to get purchase types");
  const types = await getDefaultIfError(async () => await purchaseTypeService.getTypes(ConfigTypeStatus.Deleted), []);
  const typeMap = new Map<string, string>();
  types.forEach((ctg) => {
    typeMap.set(ctg.id, ctg.value);
    typeMap.set(ctg.value, ctg.id);
  });
  logger.info("transformed to type Map, ", typeMap, ", execution Time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
  return typeMap;
};

const getPaymentAccountMap = async () => {
  const logger = getLogger("getPaymentAccountMap", rootLogger);
  const startTime = new Date();

  const pymtAccs = await getDefaultIfError(pymtAccountService.getPymtAccountList, []);
  const pymtAccMap = new Map<string, string>();
  pymtAccs.forEach((acc) => {
    pymtAccMap.set(acc.id, acc.shortName);
  });
  logger.info("transformed to pymt acc Map, ", pymtAccMap, ", execution Time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
  return pymtAccMap;
};

const getPymtAccEnum = async () => {
  const logger = getLogger("getPymtAccEnum", rootLogger);
  logger.info("cache miss. calling service to get pymt accs");
  const pymtAccMap = await getPaymentAccountMap();
  const idkeys = [...pymtAccMap.keys()];
  idkeys.forEach((pak) => {
    const pav = pymtAccMap.get(pak);
    if (pav) {
      pymtAccMap.set(pav, pak);
    }
  });
  logger.info("transformed to pymt acc Map, ", pymtAccMap);
  return pymtAccMap;
};

const updatePurchaseType = (categoryMap: Map<string, string>, item: PurchaseFields | PurchaseItemFields) => {
  if (item.purchaseTypeId && isUuid(item.purchaseTypeId) && categoryMap.get(item.purchaseTypeId)) {
    item.purchaseTypeName = categoryMap.get(item.purchaseTypeId);
  }
};

const updatePymtAcc = (pymtAccMap: Map<string, string>, item: PurchaseFields) => {
  if (item.paymentAccountId && isUuid(item.paymentAccountId) && pymtAccMap.get(item.paymentAccountId)) {
    item.paymentAccountName = pymtAccMap.get(item.paymentAccountId);
  }
};

const updatePurchaseTypeAndPymtAccName = async (purchaseItem: PurchaseFields) => {
  const logger = getLogger("updatePurchaseTypeAndPymtAccName", rootLogger);
  const startTime = new Date();
  const typeMap = await getPurchaseTypeEnum();
  const pymtAccMap = await getPymtAccEnum();
  updatePurchaseType(typeMap, purchaseItem);
  updatePymtAcc(pymtAccMap, purchaseItem);
  if (purchaseItem.items) {
    purchaseItem.items.forEach((itemBreakdown) => {
      updatePurchaseType(typeMap, itemBreakdown);
    });
  }

  const shouldRetrieveDeletedCategories = (item: PurchaseFields | PurchaseItemFields) => item.purchaseTypeId && !item.purchaseTypeName;
  if (shouldRetrieveDeletedCategories(purchaseItem) || !!purchaseItem.items?.find(shouldRetrieveDeletedCategories)) {
    const deletedTypeMap: Map<string, string> = await getDeletedPurchaseTypeEnum();
    if (shouldRetrieveDeletedCategories(purchaseItem)) {
      updatePurchaseType(deletedTypeMap, purchaseItem);
    }
    purchaseItem.items?.filter(shouldRetrieveDeletedCategories).forEach((itemBreakdown) => {
      updatePurchaseType(deletedTypeMap, itemBreakdown);
    });
  }

  if (purchaseItem.paymentAccountId && !purchaseItem.paymentAccountName) {
    const pymtAccId = purchaseItem.paymentAccountId;
    const deletedPymtAcc = await getDefaultIfError(async () => await pymtAccountService.getPymtAccount(pymtAccId), null);
    purchaseItem.paymentAccountName = deletedPymtAcc?.shortName;
  }
  logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
};

const updatePurchaseTags = async (purchase: PurchaseFields) => {
  const logger = getLogger("updatePurchaseTags", rootLogger);
  const purchaseTags = purchase.tags;
  logger.debug("purchase tags size: ", purchaseTags.length);
  const purchaseItemTags = purchase.items?.flatMap((ei) => ei.tags) || [];
  logger.debug("purchase item tags size: ", purchaseItemTags.length);
  const tags = [...purchaseTags, ...purchaseItemTags];
  await tagService.updateTags(tags);
  logger.debug("add update tags completed");
};

export const addUpdateDbPurchase = async (purchase: PurchaseFields, loggerBase: LoggerBase) => {
  // here we don't have url or file prop in receipts
  const logger = getLogger("addUpdateDbPurchase", loggerBase);
  validatePurchaseBelongsTo(purchase);

  const transformStart = new Date();
  const dbPurchase: PurchaseFields = {
    ...purchase,
    purchaseDate: getDateInstanceDefaultNewDate(purchase.purchaseDate),
    verifiedTimestamp: (purchase.verifiedTimestamp && getDateInstance(purchase.verifiedTimestamp)) || undefined,
    description: purchase.description || ""
  };
  await updatePurchaseTypeAndPymtAccName(dbPurchase);
  convertAuditFieldsToDateInstance(dbPurchase.auditDetails);
  dbPurchase.receipts = dbPurchase.receipts.map((rct) => ({ ...rct, relationId: purchase.id }));

  logger.info("transforming execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  await purchaseDb.addUpdateItem(dbPurchase);
  logger.info("dbPurchase =", dbPurchase, ", execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  return dbPurchase;
};

const initializePurchaseTags = async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }

  const thisYear = new Date().getFullYear();
  const queryParams: TagQueryParams = {
    year: [String(thisYear), String(thisYear - 1)]
  };
  const url = `${rootPath}/tags`;
  const skipApiCall = await apiUtils.isApiCalled({ listSize: 0, withinTime: "1 hour" }, url, queryParams);
  if (skipApiCall) {
    return;
  }

  const response = await axios.get(url, { params: queryParams });
  apiUtils.updateApiResponse(response);
  await tagService.updateTags(response.data);
};

const validatePurchaseBelongsTo = (purchase: ExpenseFields | null) => {
  if (purchase && purchase.belongsTo !== ExpenseBelongsTo.Purchase) {
    throw new InvalidError("incorrect expense belongs: " + purchase.belongsTo);
  }
};

let clearExpenseListCache: Function = () => {};

export const setClearExpenseListCacheHandler = (clearCache: Function) => {
  clearExpenseListCache = clearCache;
};

export const clearCache = (purchaseData?: PurchaseFields) => {
  clearExpenseListCache();
  pMemoizeClear(getPurchase);
  if (purchaseData) {
    statService.clearStatsCache(StatBelongsTo.Purchase, getDateInstanceDefaultNewDate(purchaseData.purchaseDate).getFullYear());
  } else {
    statService.clearStatsCache(StatBelongsTo.Purchase);
  }
};

export const getPurchase = pMemoize(async (purchaseId: string) => {
  const logger = getLogger("getPurchase", rootLogger);

  try {
    if (!purchaseId) {
      throw new InvalidError("purchase id is not defined");
    }

    const dbPurchase = await purchaseDb.getItem(purchaseId);

    validatePurchaseBelongsTo(dbPurchase);
    if (dbPurchase && dbPurchase.items) {
      return dbPurchase;
    }

    const response = await axios.get(rootPath + "/id/" + purchaseId);
    return addUpdateDbPurchase(response.data, logger);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("10 sec"));

export const addUpdatePurchase = pMemoize(async (purchase: PurchaseFields) => {
  const logger = getLogger("addUpdatePurchase", rootLogger);

  validatePurchaseBelongsTo(purchase);
  try {
    await updatePurchaseTypeAndPymtAccName(purchase);
    const data: PurchaseFields = {
      ...purchase,
      purchaseDate: getDateString(purchase.purchaseDate) as string,
      verifiedTimestamp: purchase.verifiedTimestamp ? getDateString(purchase.verifiedTimestamp) : undefined,
      description: purchase.description || ""
    };
    const response = await axios.post(rootPath, data);
    const purchaseResponse = response.data as PurchaseFields;

    await updatePurchaseTags(purchaseResponse);
    const purchaseReceipts = purchase.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
      obj[rct.name] = rct;
      return obj;
    }, {});

    const updateReceiptIdPromises = purchaseResponse.receipts.map(async (rct) => {
      await cacheReceiptFile(purchaseReceipts[rct.name], CacheAction.AddUpdateGet, undefined, rct);
    });
    await Promise.all(updateReceiptIdPromises);

    // cleaning memory if receipt object is removed
    const existing = await purchaseDb.getItem(purchaseResponse.id);
    if (existing) {
      const deleteReceiptPromises = existing.receipts.map(async (rct) => {
        if (!purchaseReceipts[rct.name]) {
          await cacheReceiptFile(rct, CacheAction.Remove);
        }
      });
      await Promise.all(deleteReceiptPromises);
    }

    await addUpdateDbPurchase(purchaseResponse, logger);
    clearCache(purchaseResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("5 sec"));

export const removePurchase = pMemoize(async (purchaseId: string) => {
  const logger = getLogger("removePurchase", rootLogger);

  try {
    const response = await axios.delete(rootPath + "/id/" + purchaseId);
    const purchaseResponse = response.data as PurchaseFields;

    await addUpdateDbPurchase(purchaseResponse, logger);
    const deletingReceiptPromises = purchaseResponse.receipts.map(async (rct) => {
      await cacheReceiptFile(rct, CacheAction.Remove);
    });
    await Promise.all(deletingReceiptPromises);
    clearCache(purchaseResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("3 sec"));

export const getPurchaseTags = pMemoize(async () => {
  await initializePurchaseTags();
  return tagService.getTags();
}, getCacheOption("30 sec"));

export const getPurchaseTypes = () => {
  return purchaseTypeService.getTypes(ConfigTypeStatus.Enable);
};
