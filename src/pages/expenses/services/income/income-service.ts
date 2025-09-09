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
  ConfigTypeStatus,
  getDateString,
  subtractDatesDefaultToZero,
  getDateInstanceDefaultNewDate,
  apiUtils,
  sleep
} from "../../../../shared";
import { pymtAccountService } from "../../../pymt-accounts";
import { ExpenseBelongsTo, ExpenseFields } from "../expense/field-types";
import { IncomeFields } from "./field-types";
import { receiptService } from "../receipt";
import { CacheAction, ReceiptProps } from "../../../../components/receipt";
import * as incomeTypeService from "./income-type-service";
import { StatBelongsTo, statService } from "../../../home/services";

const serviceLogger = getLogger("service.expense.income", null, null, "DISABLED");

const incomeDb = new MyLocalDatabase<IncomeFields>(LocalDBStore.Expense);
const tagService = TagsService(TagBelongsTo.Income);

const rootPath = "/expenses/income";

let clearExpenseListCache: Function = () => {};

export const setClearExpenseListCacheHandler = (clearCacheFn: Function) => {
  clearExpenseListCache = clearCacheFn;
};

const clearCache = (incomeData: IncomeFields) => {
  clearExpenseListCache();
  statService.clearStatsCache(StatBelongsTo.Income, getDateInstanceDefaultNewDate(incomeData.incomeDate).getFullYear());
  pMemoizeClear(getDetails);
};

const updatePaymentAccount = async (incomeDetails: IncomeFields) => {
  const startTime = new Date();
  const logger = getLogger("updatePaymentAccount", serviceLogger);

  if (incomeDetails.paymentAccountId && isUuid(incomeDetails.paymentAccountId)) {
    const paymentAccList = await getDefaultIfError(pymtAccountService.getPymtAccountList, []);
    let matchedPymtAcc = paymentAccList.find((pacc) => pacc.id === incomeDetails.paymentAccountId) || null;

    if (!matchedPymtAcc) {
      const paymentAccountId = incomeDetails.paymentAccountId;
      matchedPymtAcc = await getDefaultIfError(() => pymtAccountService.getPymtAccount(paymentAccountId), null);
    }

    if (matchedPymtAcc) {
      incomeDetails.paymentAccountName = matchedPymtAcc.shortName;
    }
  }

  logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
};

const updateIncomeType = async (incomeDetails: IncomeFields) => {
  const startTime = new Date();
  const logger = getLogger("updateIncomeType", serviceLogger);

  if (incomeDetails.incomeTypeId && isUuid(incomeDetails.incomeTypeId)) {
    const incomeTypeList = await getDefaultIfError(() => incomeTypeService.getList(ConfigTypeStatus.Enable), []);
    let matchedIncomeType = incomeTypeList.find((inctyp) => inctyp.id === incomeDetails.incomeTypeId) || null;

    if (!matchedIncomeType) {
      const incomeTypeId = incomeDetails.incomeTypeId;
      matchedIncomeType = await getDefaultIfError(() => incomeTypeService.getDetails(incomeTypeId), null);
    }

    if (matchedIncomeType) {
      incomeDetails.incomeTypeName = matchedIncomeType.value;
    }
  }

  logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds().value, " sec");
};

const updateTags = async (incomeDetails: IncomeFields) => {
  const logger = getLogger("updateTags", serviceLogger);
  const incomeTags = incomeDetails.tags;
  logger.debug("income tags size: ", incomeTags.length);

  await tagService.updateTags(incomeTags);
  logger.debug("add update tags completed");
};

export const addUpdateDbIncome = async (incomeDetails: IncomeFields, loggerBase: LoggerBase) => {
  // here we don't have url or file prop in receipts
  const logger = getLogger("addUpdateDbIncome", loggerBase);
  if (incomeDetails.belongsTo !== ExpenseBelongsTo.Income) {
    throw new InvalidError("this is not income");
  }
  const transformStart = new Date();
  const dbIncome: IncomeFields = {
    ...incomeDetails,
    incomeDate: getDateString(incomeDetails.incomeDate) as string
  };
  await updatePaymentAccount(dbIncome);
  await updateIncomeType(dbIncome);

  convertAuditFieldsToDateInstance(dbIncome.auditDetails);
  dbIncome.receipts = dbIncome.receipts.map((rct) => ({ ...rct, relationId: dbIncome.id }));

  logger.info("transforming execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  await incomeDb.addUpdateItem(dbIncome);
  logger.info("dbIncome =", dbIncome, ", execution time =", subtractDatesDefaultToZero(null, transformStart).toSeconds().value, " sec");
  return dbIncome;
};

const initializeIncomeTags = async () => {
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

const validateIncomeBelongsTo = (incomeDetails: ExpenseFields | null) => {
  if (incomeDetails && incomeDetails.belongsTo !== ExpenseBelongsTo.Income) {
    throw new InvalidError("incorrect expense belongs: " + incomeDetails.belongsTo);
  }
};

export const getDetails = pMemoize(async (incomeId: string) => {
  const logger = getLogger("getDetails", serviceLogger);

  try {
    if (!incomeId) {
      throw new InvalidError("income id is not defined");
    }
    const dbIncome = await incomeDb.getItem(incomeId);

    if (dbIncome) {
      validateIncomeBelongsTo(dbIncome);
      return dbIncome;
    }

    const response = await axios.get(`${rootPath}/id/${incomeId}`);
    return addUpdateDbIncome(response.data, logger);
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("10 sec"));

export const addUpdateDetails = pMemoize(async (incomeDetails: IncomeFields) => {
  const logger = getLogger("addUpdateDetails`", serviceLogger);

  try {
    validateIncomeBelongsTo(incomeDetails);
    const data: IncomeFields = {
      ...incomeDetails,
      incomeDate: incomeDetails.incomeDate as string,
      description: incomeDetails.description || ""
    };
    const response = await axios.post(rootPath, data);
    const incomeResponse = response.data as IncomeFields;

    await updateTags(incomeResponse);
    const incomeReceipts = incomeDetails.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
      obj[rct.name] = rct;
      return obj;
    }, {});

    const updateReceiptIdPromises = incomeResponse.receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(incomeReceipts[rct.name], CacheAction.AddUpdateGet, undefined, rct);
    });
    await Promise.all(updateReceiptIdPromises);

    // cleaning memory if receipt object is removed
    const existing = await incomeDb.getItem(incomeResponse.id);
    if (existing) {
      const deleteReceiptPromises = existing.receipts.map(async (rct) => {
        if (!incomeReceipts[rct.name]) {
          await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
        }
      });
      await Promise.all(deleteReceiptPromises);
    }

    await addUpdateDbIncome(incomeResponse, logger);
    clearCache(incomeResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("5 sec"));

export const removeDetails = pMemoize(async (incomeId: string) => {
  const logger = getLogger("removeDetails", serviceLogger);

  try {
    const response = await axios.delete(`${rootPath}/id/${incomeId}`);
    const incomeResponse = response.data as IncomeFields;

    await addUpdateDbIncome(incomeResponse, logger);
    const deletingReceiptPromises = incomeResponse.receipts.map(async (rct) => {
      await receiptService.cacheReceiptFile(rct, CacheAction.Remove);
    });
    await Promise.all(deletingReceiptPromises);
    clearCache(incomeResponse);
    // temporary patching until expenseCount api is fixed
    await sleep("1 sec");
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  }
}, getCacheOption("5 sec"));

export const getTags = pMemoize(async () => {
  await initializeIncomeTags();
  return tagService.getTags();
}, getCacheOption("30 sec"));
