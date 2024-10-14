import pMemoize, { pMemoizeClear } from "p-memoize";
import {
  axios,
  convertAuditFieldsToDateInstance,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  parseTimestamp,
  formatTimestamp,
  subtractDates,
  LoggerBase,
  getDefaultIfError,
  TagsService,
  TagBelongsTo,
  InvalidError,
  TagQueryParams,
  getCacheOption,
  handleAndRethrowServiceError,
  isUuid,
} from "../../../../shared";
import { pymtAccountService } from "../../../pymt-accounts";
import { ExpenseBelongsTo, ExpenseFields } from "../expense/field-types";
import { PurchaseRefundFields } from "./field-types";
import { receiptService } from "../receipt";
import { CacheAction, ReceiptProps } from "../../../../components/receipt";
import { StatBelongsTo, statService } from "../../../home/services";

const serviceLogger = getLogger("service.expense.refund", null, null, "DISABLED");
const refundDb = new MyLocalDatabase<PurchaseRefundFields>(LocalDBStore.Expense);
const tagService = TagsService(TagBelongsTo.PurchaseRefund);

const rootPath = "/expenses/refund";

let clearExpenseListCache: Function = () => {};

export const setClearExpenseListCacheHandler = (clearCacheFn: Function) => {
  clearExpenseListCache = clearCacheFn;
};

const clearCache = () => {
  clearExpenseListCache();
  statService.clearStatsCache(StatBelongsTo.Refund);
  pMemoizeClear(getDetails);
};

const getDefaultPaymentAccounts = async () => {
  const logger = getLogger("getDefaultPaymentAccounts", serviceLogger);
  const startTime = new Date();

  const pymtAccs = await getDefaultIfError(pymtAccountService.getPymtAccountList, []);

  logger.info("transformed to pymt acc, ", pymtAccs, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
  return pymtAccs;
};

const getPaymentAccount = async (paymentAccId: string) => {
  const logger = getLogger("getPaymentAccount", serviceLogger);
  const startTime = new Date();

  const pymtAcc = await getDefaultIfError(async () => await pymtAccountService.getPymtAccount(paymentAccId), null);

  logger.info("transformed to pymt acc, ", pymtAcc, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
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

  logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
};

const updateTags = async (refund: PurchaseRefundFields) => {
  const logger = getLogger("updateTags", serviceLogger);
  const refundTags = refund.tags;
  logger.debug("purchase refund tags size: ", refundTags.length);

  await tagService.updateTags(refundTags);
  logger.debug("add update tags completed");
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
    refundDate: typeof refunddetails.refundDate === "string" ? parseTimestamp(refunddetails.refundDate) : refunddetails.refundDate,
  };
  await updatePaymentAccount(dbRefund);

  convertAuditFieldsToDateInstance(dbRefund.auditDetails);
  dbRefund.receipts = dbRefund.receipts.map((rct) => ({ ...rct, relationId: dbRefund.id }));
  await initializeRefundTags();
  await updateTags(dbRefund);

  logger.info("transforming execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
  await refundDb.addUpdateItem(dbRefund);
  logger.info("dbPurchase =", dbRefund, ", execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
  return dbRefund;
};

const initializeRefundTags = async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }

  const thisYear = new Date().getFullYear();
  const queryParams: TagQueryParams = {
    year: [String(thisYear), String(thisYear - 1)],
  };
  const response = await axios.get(`${rootPath}/tags`, { params: queryParams });
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
      refundDate: refunddetails.refundDate instanceof Date ? formatTimestamp(refunddetails.refundDate) : refunddetails.refundDate,
      purchaseId: refunddetails.purchaseDetails?.id || refunddetails.purchaseId,
      purchaseDetails: undefined,
    };
    const response = await axios.post(rootPath, data);

    const refundReceipts = refunddetails.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
      obj[rct.name] = rct;
      return obj;
    }, {});

    const updateReceiptIdPromises = (response.data as PurchaseRefundFields).receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(refundReceipts[rct.name], CacheAction.AddUpdateGet, undefined, rct);
    });
    await Promise.all(updateReceiptIdPromises);

    // cleaning memory if receipt object is removed
    const existing = await refundDb.getItem(response.data.id);
    if (existing) {
      const deleteReceiptPromises = existing.receipts.map(async (rct) => {
        if (!refundReceipts[rct.name]) {
          await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
        }
      });
      await Promise.all(deleteReceiptPromises);
    }

    await addUpdateDbRefund(response.data, logger);
    clearCache();
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("5 sec"));

export const removeDetails = pMemoize(async (refundId: string) => {
  const logger = getLogger("removeDetails", serviceLogger);

  try {
    const response = await axios.delete(`${rootPath}/id/${refundId}`);
    await addUpdateDbRefund(response.data, logger);
    const deletingReceiptPromises = (response.data as PurchaseRefundFields).receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
    });
    await Promise.all(deletingReceiptPromises);
    clearCache();
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("3 sec"));

export const getTags = () => {
  return tagService.getTags();
};
