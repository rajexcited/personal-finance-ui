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
} from "../../../../shared";
import { ExpenseBelongsTo, ExpenseFields, ExpenseStatus } from "./field-types";
import { PurchaseFields, purchaseService } from "../purchase";
import { refundService } from "../refund";
import { incomeService } from "../income";
import { StatBelongsTo, statService } from "../../../home/services";

type ExpenseQueryParams = Record<"pageNo" | "status" | "pageMonths" | "belongsTo", string[]>;

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);

const rootPath = "/expenses";
const _logger = getLogger("service.expense", null, null, "DISABLED");

const getExpenseCount = pMemoize(async (queryParams: ExpenseQueryParams) => {
  const countResponse = await axios.get(`${rootPath}/count`, { params: queryParams });
  return Number(countResponse.data);
}, getCacheOption("3 min"));

export const getExpenseList = pMemoize(async (pageNo: number, status?: ExpenseStatus, pageMonths?: number, belongsTo?: ExpenseBelongsTo) => {
  const logger = getLogger("getExpenseList", _logger);

  const startTime = new Date();
  try {
    const queryPageMonths = pageMonths === undefined ? 3 : pageMonths;
    const queryParams: ExpenseQueryParams = {
      pageNo: [String(pageNo)],
      status: [status || ExpenseStatus.Enable],
      pageMonths: [String(queryPageMonths)],
      belongsTo: belongsTo ? [String(belongsTo)] : [],
    };

    let expenses: ExpenseFields[] = [];
    let expenseCount: number | null = null;
    if (status !== ExpenseStatus.Deleted) {
      const dbExpensePromise = expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, queryParams.status[0]);
      const expenseCountPromise = getExpenseCount(queryParams);
      await Promise.all([dbExpensePromise, expenseCountPromise]);
      const dbExpenses = await dbExpensePromise;
      logger.info("expenseDb.getAllFromIndex and expenseCount.api execution time =", subtractDates(null, startTime).toSeconds(), " sec.");

      const rangeStartDate = datetime.addMonths(new Date(), queryPageMonths * -1 * pageNo);
      const rangeEndDate = datetime.addMonths(new Date(), queryPageMonths * -1 * (pageNo - 1));
      const filteredExpenses = dbExpenses.filter((xpns) => {
        if (xpns.auditDetails.updatedOn >= rangeStartDate && xpns.auditDetails.updatedOn <= rangeEndDate) {
          return true;
        }
        return false;
      });
      logger.info("db expenses =", [...filteredExpenses]);
      expenseCount = await expenseCountPromise;
      if (filteredExpenses.length === expenseCount) {
        logger.info(
          "filteredExpenses from DB, queryParams =",
          queryParams,
          ", filteredExpenses.length=",
          filteredExpenses.length,
          ", execution time =",
          subtractDates(null, startTime).toSeconds(),
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
        subtractDates(null, apiStartTime).toSeconds(),
        " sec and time diff from request start =",
        subtractDates(null, startTime),
        " sec"
      );
      logger.info("api execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");

      apiStartTime = new Date();
      expenses = response.data;

      if (!belongsTo) {
        statService.clearStatsCache(StatBelongsTo.Purchase);
        statService.clearStatsCache(StatBelongsTo.Refund);
        statService.clearStatsCache(StatBelongsTo.Income);
      } else if (belongsTo === ExpenseBelongsTo.Purchase) {
        statService.clearStatsCache(StatBelongsTo.Purchase);
      } else if (belongsTo === ExpenseBelongsTo.PurchaseRefund) {
        statService.clearStatsCache(StatBelongsTo.Refund);
      } else {
        // if (belongsTo === ExpenseBelongsTo.Income)
        statService.clearStatsCache(StatBelongsTo.Income);
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
    logger.info("transformed expense resources, execution time =", subtractDates(null, startTime).toSeconds(), " sec");

    const transformedExpenses = await Promise.all(promises);
    const returnResp = transformedExpenses.filter((xpns) => xpns !== undefined);

    return returnResp as ExpenseFields[];
  } catch (e) {
    handleAndRethrowServiceError(e as Error, logger);
    throw new Error("this never gets thrown");
  } finally {
    logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
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
