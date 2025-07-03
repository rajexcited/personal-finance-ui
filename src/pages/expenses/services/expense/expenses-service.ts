import pMemoize, { pMemoizeClear } from "p-memoize";
import datetime from "date-and-time";
import {
  axios,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LocalDBStoreIndex,
  subtractDates,
  getCacheOption,
  handleAndRethrowServiceError,
  LoggerBase,
  subtractDatesDefaultToZero
} from "../../../../shared";
import { ExpenseBelongsTo, ExpenseFields, ExpenseStatus } from "./field-types";
import { PurchaseFields, purchaseService } from "../purchase";
import { refundService } from "../refund";
import { incomeService } from "../income";
import { StatBelongsTo, statService } from "../../../home/services";
import { getExpenseDateInstance } from "./utils";

type ExpenseQueryParams = Record<"pageNo" | "status" | "pageMonths" | "belongsTo", string[]>;

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);

const rootPath = "/expenses";
const _logger = getLogger("service.expense", null, null, "DISABLED");

const getExpenseCount = pMemoize(async (queryParams: ExpenseQueryParams) => {
  const countResponse = await axios.get(`${rootPath}/count`, { params: queryParams });
  return Number(countResponse.data);
}, getCacheOption("20 min"));

const isExpenseWithinRange = (expense: ExpenseFields, rangeStartDate: Date, rangeEndDate: Date, logger: LoggerBase) => {
  const expenseDate = getExpenseDateInstance(expense, logger);
  if (!expenseDate) {
    logger.debug("expense date not found");
    return false;
  }

  return expenseDate >= rangeStartDate && expenseDate <= rangeEndDate;
};

export const getExpenseList = pMemoize(async (pageNo: number, status?: ExpenseStatus, pageMonths?: number, belongsTo?: ExpenseBelongsTo) => {
  const logger = getLogger("getExpenseList", _logger);

  const startTime = new Date();
  try {
    const queryPageMonths = pageMonths === undefined ? 3 : pageMonths;
    const queryParams: ExpenseQueryParams = {
      pageNo: [String(pageNo)],
      status: [status || ExpenseStatus.Enable],
      pageMonths: [String(queryPageMonths)],
      belongsTo: belongsTo ? [String(belongsTo)] : []
    };

    let expenses: ExpenseFields[] = [];
    let expenseCount: number | null = null;
    if (status !== ExpenseStatus.Deleted) {
      const dbExpensePromise = expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, queryParams.status[0]);
      const expenseCountPromise = getExpenseCount(queryParams);
      await Promise.all([dbExpensePromise, expenseCountPromise]);
      const dbExpenses = await dbExpensePromise;
      logger.debug(
        "expenseDb.getAllFromIndex and expenseCount.api execution time =",
        subtractDatesDefaultToZero(null, startTime).toSeconds(),
        " sec."
      );

      const rangeStartDate = datetime.addMonths(new Date(), queryPageMonths * -1 * pageNo);
      const rangeEndDate = datetime.addMonths(new Date(), queryPageMonths * -1 * (pageNo - 1));
      const filteredExpenses = dbExpenses.filter((xpns) => isExpenseWithinRange(xpns, rangeStartDate, rangeEndDate, logger));
      expenseCount = await expenseCountPromise;
      logger.debug(filteredExpenses.length, "db expenses =", [...filteredExpenses], "and expense count from api is", expenseCount);
      if (filteredExpenses.length === expenseCount) {
        logger.info(
          "filteredExpenses from DB, queryParams =",
          queryParams,
          ", filteredExpenses.length=",
          filteredExpenses.length,
          ", execution time =",
          subtractDatesDefaultToZero(null, startTime).toSeconds(),
          " sec"
        );
        expenses = filteredExpenses;
      }
    }

    if (expenseCount !== null && expenses.length !== expenseCount) {
      // call api to refresh the list
      let apiStartTime = new Date();

      const response = await axios.get(rootPath, { params: queryParams });
      logger.info(
        "getExpenses api, queryParams =",
        queryParams,
        ", api execution time =",
        subtractDatesDefaultToZero(null, apiStartTime).toSeconds(),
        " sec and time diff from request start =",
        subtractDates(null, startTime),
        " sec"
      );
      logger.info("api execution time =", subtractDatesDefaultToZero(null, apiStartTime).toSeconds(), " sec");

      apiStartTime = new Date();
      expenses = response.data;
      const expenseYears = expenses.map((xpns) => getExpenseDateInstance(xpns, logger)?.getFullYear() as number).filter((yr) => yr !== undefined);

      const years = [...new Set(expenseYears)];
      logger.debug("expenses=", expenses, "expenseYears=", expenseYears, "years=", years, "belongsTo=", belongsTo);

      if (!belongsTo) {
        const statCacheClearPromiseList = [StatBelongsTo.Purchase, StatBelongsTo.Income, StatBelongsTo.Refund].map((statBelongsTo) =>
          statService.clearStatsCache(statBelongsTo, years)
        );
        await Promise.all(statCacheClearPromiseList);
      } else if (belongsTo === ExpenseBelongsTo.Purchase) {
        await statService.clearStatsCache(StatBelongsTo.Purchase, years);
      } else if (belongsTo === ExpenseBelongsTo.PurchaseRefund) {
        await statService.clearStatsCache(StatBelongsTo.Refund, years);
      } else {
        // if (belongsTo === ExpenseBelongsTo.Income)
        await statService.clearStatsCache(StatBelongsTo.Income, years);
      }
    }

    const promises = expenses.map(async (expense) => {
      if (expense.belongsTo === ExpenseBelongsTo.Purchase) {
        return await purchaseService.addUpdateDbPurchase(expense, logger);
      }
      if (expense.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
        return await refundService.addUpdateDbRefund(expense, logger);
      }
      if (expense.belongsTo === ExpenseBelongsTo.Income) {
        return await incomeService.addUpdateDbIncome(expense, logger);
      }
    });
    logger.info("transformed expense resources, execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds(), " sec");

    const transformedExpenses = await Promise.all(promises);
    const returnResp = transformedExpenses.filter((xpns) => xpns !== undefined);

    return returnResp as ExpenseFields[];
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  } finally {
    logger.info("execution time =", subtractDatesDefaultToZero(null, startTime).toSeconds(), " sec");
  }
}, getCacheOption("3 min"));

export const getPurchaseList = async (pageNo: number, pageMonths: number) => {
  const list = await getExpenseList(pageNo, ExpenseStatus.Enable, pageMonths, ExpenseBelongsTo.Purchase);
  return list as PurchaseFields[];
};

const clearExpenseListCache = () => {
  pMemoizeClear(getExpenseList);
  pMemoizeClear(getExpenseCount);
};

purchaseService.setClearExpenseListCacheHandler(clearExpenseListCache);
incomeService.setClearExpenseListCacheHandler(clearExpenseListCache);
refundService.setClearExpenseListCacheHandler(clearExpenseListCache);
