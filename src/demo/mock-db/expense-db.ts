import datetime from "date-and-time";
import { ExpenseStatus, ExpenseFields } from "../../pages/expenses";
import { parseTimestamp, getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
const _rootLogger = getLogger("mock.db.expense", null, null, "DEBUG");

// initialize on page load
const init = async () => {
  const logger = getLogger("init", _rootLogger);
  logger.debug("start");
};

await init();

export interface ExpenseFilter {
  status?: ExpenseStatus[];
  pageNo?: number;
  pageMonths?: number;
}

const getDateInstance = (date: string | Date) => {
  if (date instanceof Date) {
    return date;
  }
  return parseTimestamp(date);
};

export const getExpenses = async (filters: ExpenseFilter) => {
  const logger = getLogger("getlist", _rootLogger);

  const filterStatuses = !filters.status || filters.status.length === 0 ? [ExpenseStatus.Enable] : filters.status;
  const expensePromises = filterStatuses.map((status) => {
    logger.debug("retrieving expenses for status [", status, "]");
    return expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status);
  });
  const expenses = (await Promise.all(expensePromises)).flatMap((xp) => xp);
  logger.debug("retieved", expenses.length, "expenses. now filtering by given params");

  const pageMonths = filters.pageMonths || 3;
  const pageNo = filters.pageNo || 1;
  const rangeStartDate = datetime.addMonths(new Date(), pageMonths * -1 * pageNo);
  const rangeEndDate = datetime.addMonths(new Date(), pageMonths * -1 * (pageNo - 1));
  logger.debug(
    "filter params with given or default values",
    "pageMonths =",
    pageMonths,
    ", pageNo =",
    pageNo,
    ", rangeStartDate =",
    rangeStartDate,
    ", rangeEndDate =",
    rangeEndDate
  );
  const filteredExpenses = expenses.filter((xpns) => {
    logger.debug("expense id=", xpns.id, ", purchase date=", xpns.purchasedDate, ", updatedOn=", xpns.auditDetails.updatedOn);
    const purchasedDate = getDateInstance(xpns.purchasedDate);
    if (purchasedDate >= rangeStartDate && purchasedDate <= rangeEndDate) {
      return true;
    }
    const updatedOn = getDateInstance(xpns.auditDetails.updatedOn);
    if (updatedOn >= rangeStartDate && updatedOn <= rangeEndDate) {
      return true;
    }
    return false;
  });

  logger.debug(
    "expense Ids =",
    expenses.map((xpns) => xpns.id),
    ", size=",
    expenses.length,
    "filtered expense Ids =",
    filteredExpenses.map((xpns) => xpns.id),
    ", size=",
    filteredExpenses.length
  );

  return {
    list: filteredExpenses.map(
      (xp) =>
        ({
          ...xp,
          expenseItems: undefined,
        } as ExpenseFields)
    ),
  };
};
