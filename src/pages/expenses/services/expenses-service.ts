import {
  axios,
  convertAuditFieldsToDateInstance,
  handleRestErrors,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LocalDBStoreIndex,
  parseTimestamp,
  subtractDates,
  LoggerBase,
  getDefaultIfError,
} from "../../../shared";
import { PymtAccountService } from "../../pymt-accounts";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import datetime from "date-and-time";
import ms from "ms";
import pDebounce from "p-debounce";
import { ExpenseBelongsTo, ExpenseFields, ExpenseStatus } from "./field-types";
import { PurchaseFields, PurchaseService } from "./purchase";

type ExpenseQueryParams = Record<"pageNo" | "status" | "pageMonths", string[]>;

export const ExpenseService = () => {
  const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
  const pymtAccService = PymtAccountService();
  const purchaseService = PurchaseService();

  const rootPath = "/expenses";
  const _logger = getLogger("service.expense");

  const getPaymentAccountMap = async () => {
    const logger = getLogger("getPaymentAccountMap", _logger);
    const startTime = new Date();

    const pymtAccs = await getDefaultIfError(pymtAccService.getPymtAccountList, []);
    const pymtAccMap = new Map<string, string>();
    pymtAccs.forEach((acc) => {
      pymtAccMap.set(acc.id, acc.shortName);
    });
    logger.info("transformed to pymt acc Map, ", pymtAccMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
    return pymtAccMap;
  };

  const getExpenseCount = pMemoize(
    async (queryParams: ExpenseQueryParams) => {
      const countResponse = await axios.get(`${rootPath}/count`, { params: queryParams });
      return Number(countResponse.data);
    },
    { cache: new ExpiryMap(ms("3 min")), cacheKey: JSON.stringify }
  );

  const isPurchaseWithinRange = (purchase: PurchaseFields, rangeStartDate: Date, rangeEndDate: Date) => {
    if (purchase.purchasedDate >= rangeStartDate && purchase.purchasedDate <= rangeEndDate) {
      return true;
    }
    return false;
  };

  const getExpenseList = async (pageNo: number, status?: ExpenseStatus) => {
    const logger = getLogger("getList", _logger);

    const startTime = new Date();
    try {
      const queryPageMonths = 3;
      const queryParams: ExpenseQueryParams = {
        pageNo: [String(pageNo)],
        status: [status || ExpenseStatus.Enable],
        pageMonths: [String(queryPageMonths)],
      };

      let expenses: ExpenseFields[] = [];
      let expenseCount: number | null = null;
      if (status !== ExpenseStatus.Deleted) {
        const dbExpensePromise = expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status || ExpenseStatus.Enable);
        const expenseCountPromise = getExpenseCount(queryParams);
        await Promise.all([dbExpensePromise, expenseCountPromise]);
        const dbExpenses = await dbExpensePromise;
        logger.info("expenseDb.getAllFromIndex and expenseCount.api execution time =", subtractDates(null, startTime).toSeconds(), " sec.");

        const rangeStartDate = datetime.addMonths(new Date(), queryPageMonths * -1 * pageNo);
        const rangeEndDate = datetime.addMonths(new Date(), queryPageMonths * -1 * (pageNo - 1));
        const filteredExpenses = dbExpenses.filter((xpns) => {
          if (xpns.belongsTo === ExpenseBelongsTo.Purchase && isPurchaseWithinRange(xpns, rangeStartDate, rangeEndDate)) {
            return true;
          }
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

        const responsePromise = axios.get(rootPath, { params: queryParams });
        await responsePromise;
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
        expenses = (await responsePromise).data;
      }

      const promises = expenses.map(async (expense) => {
        if (expense.belongsTo === ExpenseBelongsTo.Purchase) {
          return await purchaseService.addUpdateDbPurchase(expense, logger);
        }
      });
      logger.info("transformed expense resources, execution time =", subtractDates(null, startTime).toSeconds(), " sec");

      const transformedExpenses = await Promise.all(promises);
      const returnResp = transformedExpenses
        .map((xpns) => {
          let expnse = null;
          if (xpns) {
            if (xpns.belongsTo === ExpenseBelongsTo.Purchase) {
              expnse = { ...xpns, items: undefined };
            }
            expnse = { ...xpns };
          }
          return expnse;
        })
        .filter((xpns) => xpns !== null);

      return returnResp as ExpenseFields[];
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    } finally {
      logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
    }
  };

  return {
    getExpenseList: pDebounce(getExpenseList, ms("1 sec")),
    getPaymentAccountMap,
  };
};
