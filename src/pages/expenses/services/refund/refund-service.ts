import pMemoize, { pMemoizeClear } from "p-memoize";
import {
  axios,
  convertAuditFieldsToDateInstance,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LoggerBase,
  getDefaultIfError,
  TagsService,
  TagBelongsTo,
  InvalidError,
  TagQueryParams,
  getCacheOption,
  handleAndRethrowServiceError,
  isUuid,
  getDateString,
  ConfigTypeStatus,
  getDateInstanceDefaultNewDate,
  subtractDatesDefaultToZero,
  apiUtils,
  sleep
} from "../../../../shared";
import { pymtAccountService } from "../../../pymt-accounts";
import { ExpenseBelongsTo, ExpenseFields } from "../expense/field-types";
import { PurchaseRefundFields } from "./field-types";
import { receiptService } from "../receipt";
import { CacheAction, ReceiptProps } from "../../../../components/receipt";
import { StatBelongsTo, statService } from "../../../home/services";
import { refundReasonService } from ".";

const serviceLogger = getLogger("service.expense.refund", null, null, "DISABLED");
const refundDb = new MyLocalDatabase<PurchaseRefundFields>(LocalDBStore.Expense);
const tagService = TagsService(TagBelongsTo.PurchaseRefund);

const rootPath = "/expenses/refund";

let clearExpenseListCache: Function = () => {};

export const setClearExpenseListCacheHandler = (clearCacheFn: Function) => {
  clearExpenseListCache = clearCacheFn;
};

const clearCache = (refundData: PurchaseRefundFields) => {
  clearExpenseListCache();
  statService.clearStatsCache(StatBelongsTo.Refund, getDateInstanceDefaultNewDate(refundData.refundDate).getFullYear());
  pMemoizeClear(getDetails);
};

const getDefaultPaymentAccounts = async () => {
  const logger = getLogger("getDefaultPaymentAccounts", serviceLogger);
  const startTime = new Date();

  const pymtAccs = await getDefaultIfError(pymtAccountService.getPymtAccountList, []);

  logger.info("transformed to pymt acc, ", pymtAccs, ", execution Time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
  return pymtAccs;
};

const getPaymentAccount = async (paymentAccId: string) => {
  const logger = getLogger("getPaymentAccount", serviceLogger);
  const startTime = new Date();

  const pymtAcc = await getDefaultIfError(async () => await pymtAccountService.getPymtAccount(paymentAccId), null);

  logger.info("transformed to pymt acc, ", pymtAcc, ", execution Time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
  return pymtAcc;
};

const updatePaymentAccount = async (refunditem: PurchaseRefundFields) => {
  let startTime = new Date();
  const logger = getLogger("updatePaymentAccount", serviceLogger);

  if (refunditem.paymentAccountId && isUuid(refunditem.paymentAccountId)) {
    const paymentAccList = await getDefaultPaymentAccounts();
    let matchedPymtAcc = paymentAccList.find((pacc) => pacc.id === refunditem.paymentAccountId) || null;

    if (!matchedPymtAcc) {
      matchedPymtAcc = await getPaymentAccount(refunditem.paymentAccountId);
    }

    if (matchedPymtAcc) {
      refunditem.paymentAccountName = matchedPymtAcc.shortName;
    }
  }

  logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
};

const updateTags = async (refund: PurchaseRefundFields) => {
  const logger = getLogger("updateTags", serviceLogger);
  const refundTags = refund.tags;
  logger.debug("purchase refund tags size: ", refundTags.length);

  await tagService.updateTags(refundTags);
  logger.debug("add update tags completed");
};

const updateReasonValue = async (refundDetails: PurchaseRefundFields) => {
  let startTime = new Date();
  const logger = getLogger("updateReasonValue", serviceLogger);

  if (refundDetails.reasonId && isUuid(refundDetails.reasonId)) {
    const reasonList = await getDefaultIfError(() => refundReasonService.getReasonList(ConfigTypeStatus.Enable), []);
    let matchedReason = reasonList.find((rsn) => rsn.id === refundDetails.reasonId) || null;

    if (!matchedReason) {
      const reasonId = refundDetails.reasonId;
      matchedReason = await getDefaultIfError(() => refundReasonService.getReason(reasonId), null);
    }

    if (matchedReason) {
      refundDetails.reasonValue = matchedReason.value;
    }
  }

  logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
};

export const addUpdateDbRefund = async (refunddetails: PurchaseRefundFields, loggerBase: LoggerBase) => {
  // here we don't have url or file prop in receipts
  const logger = getLogger("addUpdateDbRefund", loggerBase);
  if (refunddetails.belongsTo !== ExpenseBelongsTo.PurchaseRefund) {
    throw new InvalidError("this is not refund");
  }
  const transformStart = new Date();
  const dbRefund: PurchaseRefundFields = {
    ...refunddetails,
    refundDate: getDateInstanceDefaultNewDate(refunddetails.refundDate),
    description: refunddetails.description || ""
  };
  await updatePaymentAccount(dbRefund);
  await updateReasonValue(dbRefund);

  convertAuditFieldsToDateInstance(dbRefund.auditDetails);
  dbRefund.receipts = dbRefund.receipts.map((rct) => ({ ...rct, relationId: dbRefund.id }));

  logger.info("transforming execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  await refundDb.addUpdateItem(dbRefund);
  logger.info("dbPurchase =", dbRefund, ", execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  return dbRefund;
};

const initializeRefundTags = async () => {
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

const validateRefundBelongsTo = (refund: ExpenseFields | null) => {
  if (refund && refund.belongsTo !== ExpenseBelongsTo.PurchaseRefund) {
    throw new InvalidError("incorrect expense belongs: " + refund.belongsTo);
  }
};

export const getDetails = pMemoize(async (refundId: string) => {
  const logger = getLogger("getDetails", serviceLogger);

  try {
    if (!refundId) {
      throw new InvalidError("refund id is not defined");
    }

    const dbRefund = await refundDb.getItem(refundId);

    if (dbRefund) {
      validateRefundBelongsTo(dbRefund);
      return dbRefund;
    }

    const response = await axios.get(`${rootPath}/id/${refundId}`);
    return addUpdateDbRefund(response.data, logger);
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("10 sec"));

export const addUpdateDetails = pMemoize(async (refunddetails: PurchaseRefundFields) => {
  const logger = getLogger("addUpdateDetails`", serviceLogger);

  try {
    validateRefundBelongsTo(refunddetails);
    const data: PurchaseRefundFields = {
      ...refunddetails,
      refundDate: getDateString(refunddetails.refundDate) as string,
      purchaseId: refunddetails.purchaseDetails?.id || refunddetails.purchaseId,
      purchaseDetails: undefined
    };
    const response = await axios.post(rootPath, data);
    const refundResponse = response.data as PurchaseRefundFields;
    await updateTags(refundResponse);

    const refundReceipts = refunddetails.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
      obj[rct.name] = rct;
      return obj;
    }, {});

    const updateReceiptIdPromises = refundResponse.receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(refundReceipts[rct.name], CacheAction.AddUpdateGet, undefined, rct);
    });
    await Promise.all(updateReceiptIdPromises);

    // cleaning memory if receipt object is removed
    const existing = await refundDb.getItem(refundResponse.id);
    if (existing) {
      const deleteReceiptPromises = existing.receipts.map(async (rct) => {
        if (!refundReceipts[rct.name]) {
          await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
        }
      });
      await Promise.all(deleteReceiptPromises);
    }

    await addUpdateDbRefund(refundResponse, logger);
    clearCache(refundResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("5 sec"));

export const removeDetails = pMemoize(async (refundId: string) => {
  const logger = getLogger("removeDetails", serviceLogger);

  try {
    const response = await axios.delete(`${rootPath}/id/${refundId}`);
    const refundResponse = response.data as PurchaseRefundFields;

    await addUpdateDbRefund(refundResponse, logger);
    const deletingReceiptPromises = refundResponse.receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
    });
    await Promise.all(deletingReceiptPromises);
    clearCache(refundResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("3 sec"));

export const getTags = pMemoize(async () => {
  await initializeRefundTags();
  return tagService.getTags();
}, getCacheOption("30 sec"));
