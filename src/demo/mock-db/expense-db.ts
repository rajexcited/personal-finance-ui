import * as datetime from "date-and-time";
import { ExpenseStatus, ExpenseFields } from "../../pages/expenses";
import { parseTimestamp, getLogger, LoggerBase } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { ExpenseBelongsTo, PurchaseFields } from "../../pages/expenses/services";
import { clearReceiptDb } from "./receipts-db";

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
const rootLogger = getLogger("mock.db.expense", null, null, "DISABLED");

// initialize on page load
const init = async () => {
  const logger = getLogger("init", rootLogger);
  logger.debug("start");
};

await init();

export const clearExpenseDb = async () => {
  const _logger = getLogger("clearExpenseDb", rootLogger);
  await Promise.all([expenseDb.clearAll(), clearReceiptDb()]);
};

export interface ExpenseFilter {
  status?: ExpenseStatus[];
  pageNo?: number;
  pageMonths?: number;
  belongsTo?: ExpenseBelongsTo;
}

const getDateInstance = (date: string | Date) => {
  if (date instanceof Date) {
    return date;
  }
  return parseTimestamp(date);
};

export const getExpenseDate = (xpns: ExpenseFields, logger: LoggerBase) => {
  let xpnsDate: Date;
  if (xpns.belongsTo === ExpenseBelongsTo.Purchase) {
    xpnsDate = getDateInstance(xpns.purchaseDate);
  } else if (xpns.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
    xpnsDate = getDateInstance(xpns.refundDate);
  } else {
    xpnsDate = getDateInstance(xpns.incomeDate);
  }

  logger.debug("expense id =", xpns.id, ", expenseDate =", xpnsDate);
  return xpnsDate;
};

export const getExpenses = async (filters: ExpenseFilter) => {
  const logger = getLogger("getlist", rootLogger);

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
    rangeEndDate,
    "belongsTo =",
    filters.belongsTo
  );

  const filteredExpenses = expenses
    .filter((xpns) => {
      const expenseDate = getExpenseDate(xpns, logger);
      return expenseDate >= rangeStartDate && expenseDate <= rangeEndDate;
    })
    .filter((xpns) => {
      if (filters.belongsTo && filters.belongsTo !== xpns.belongsTo) {
        return false;
      }
      return true;
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
    list: filteredExpenses.map((xp) => {
      if (xp.belongsTo === ExpenseBelongsTo.Purchase) {
        const res = { ...xp, items: undefined };
        return res as PurchaseFields;
      }
      return xp;
    })
  };
};
