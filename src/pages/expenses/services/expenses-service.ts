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
} from "../../../services";
import { PymtAccountService } from "../../pymt-accounts";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import datetime from "date-and-time";
import ms from "ms";
import pDebounce from "p-debounce";
import { ExpenseFields, ExpenseStatus } from "./field-types";

type ExpenseQueryParams = Record<"pageNo" | "status" | "pageMonths", string[]>;

export const ExpenseService = () => {
  const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
  const pymtAccService = PymtAccountService();

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

      if (status !== ExpenseStatus.Deleted) {
        const dbExpenses = await expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status || ExpenseStatus.Enable);
        logger.info("expenseDb.getAllFromIndex execution time =", subtractDates(null, startTime).toSeconds(), " sec.");

        const rangeStartDate = datetime.addMonths(new Date(), queryPageMonths * -1 * pageNo);
        const rangeEndDate = datetime.addMonths(new Date(), queryPageMonths * -1 * (pageNo - 1));
        const filteredExpenses = dbExpenses.filter((xpns) => {
          if (xpns.purchasedDate >= rangeStartDate && xpns.purchasedDate <= rangeEndDate) {
            return true;
          }
          if (xpns.auditDetails.updatedOn >= rangeStartDate && xpns.auditDetails.updatedOn <= rangeEndDate) {
            return true;
          }
          return false;
        });
        logger.info("db expenses =", [...filteredExpenses]);
        const expenseCount = await getExpenseCount(queryParams);
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
          return filteredExpenses;
        }
      }

      // call api to refresh the list
      let apiStartTime = new Date();

      const responsePromise = axios.get(rootPath, { params: queryParams });
      logger.info("getExpenses api, queryParams =", queryParams, ", execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");
      await responsePromise;
      // await Promise.all([responsePromise, getCategoryEnum(), getPymtAccEnum()]);
      logger.info("api execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");

      apiStartTime = new Date();
      const responseData = (await responsePromise).data as ExpenseFields[];
      const promises = responseData.map((expense) => addUpdateDbExpense(expense, logger));
      logger.info("transformed expense resources, execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");

      return (await Promise.all(promises)).map((expense) => ({ ...expense, expenseItems: undefined }));
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    } finally {
      logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
    }
  };

  const addUpdateDbExpense = async (expense: ExpenseFields, loggerBase: LoggerBase) => {
    // here we don't have url or file prop in receipts
    const logger = getLogger("addUpdateDbExpense", loggerBase);
    const transformStart = new Date();
    const dbExpense: ExpenseFields = {
      ...expense,
      purchasedDate: typeof expense.purchasedDate === "string" ? parseTimestamp(expense.purchasedDate) : expense.purchasedDate,
      verifiedTimestamp: typeof expense.verifiedTimestamp === "string" ? parseTimestamp(expense.verifiedTimestamp) : expense.verifiedTimestamp,
    };
    // await updateCategoryAndPymtAccName(dbExpense);
    convertAuditFieldsToDateInstance(dbExpense.auditDetails);
    dbExpense.receipts = dbExpense.receipts.map((rct) => ({ ...rct, expenseId: expense.id }));
    // await initializeExpenseTags();
    // await tagService.updateExpenseTags(dbExpense);

    logger.info("transforming execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    await expenseDb.addUpdateItem(dbExpense);
    logger.info("dbExpense =", dbExpense, ", execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    return dbExpense;
  };

  return {
    getExpenseList: pDebounce(getExpenseList, ms("1 sec")),
    getPaymentAccountMap,
  };
};
