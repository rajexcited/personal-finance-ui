import { getLogger, LoggerBase, parseTimestamp } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { ExpenseBelongsTo, ExpenseFields } from "../../pages/expenses/services";
import { MonthlyStatResource, StatBelongsTo, StatisticsBaseResource, StatsExpenseResource } from "../../pages/home/services/field-types";
import { v4 as uuidv4 } from "uuid";
import { getExpenseDate } from "./expense-db";

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
const _rootLogger = getLogger("mock.db.expense.stats", null, null, "DEBUG");

const getExpenseDateYear = (xpns: ExpenseFields, logger: LoggerBase) => {
  return getExpenseDate(xpns, logger).getFullYear();
};

const getMonthName = (monthNo: number, year: number) => {
  return new Date(year, monthNo - 1, 1).toLocaleString("default", { month: "long" });
};

export const getExpenseStats = async (belongsTo: StatBelongsTo, year: number) => {
  const logger = getLogger("getExpenseStats", _rootLogger);

  const expenseList = await getExpenseList(belongsTo, year, logger);
  type _MonthlyStatResource = Omit<MonthlyStatResource, "total"> & {
    total: number;
  };
  type _StatisticsBaseResource = Omit<StatisticsBaseResource, "total" | "monthlyTotal"> & {
    total: number;
    monthlyTotal: Record<number, _MonthlyStatResource>;
  };

  const statDetails: _StatisticsBaseResource = {
    total: 0,
    count: 0,
    monthlyTotal: {},
    description: "stat details for year " + year,
  };

  for (let i = 1; i < 13; i++) {
    statDetails.monthlyTotal[i] = {
      total: 0,
      count: 0,
      monthName: getMonthName(i, year),
      monthNo: i,
    };
  }

  expenseList.forEach((xpns) => {
    const amount = xpns.amount ? Number(xpns.amount) : 0;
    statDetails.count++;
    statDetails.total += amount;
    const expenseDateMonth = getExpenseDate(xpns, logger).getMonth();
    statDetails.monthlyTotal[expenseDateMonth + 1].count++;
    statDetails.monthlyTotal[expenseDateMonth + 1].total += amount;
  });

  logger.debug("statDetails =", statDetails);

  const convertedStatDetails: StatisticsBaseResource = {
    ...statDetails,
    total: String(statDetails.total),
    monthlyTotal: Object.values(statDetails.monthlyTotal).map((mt) => ({ ...mt, total: String(mt.total) })),
  };

  const statResource: StatsExpenseResource = {
    belongsTo: belongsTo,
    id: uuidv4(),
    year: String(year),
    details: convertedStatDetails,
    byPersonTags: [],
    byPymtAcc: [],
    byTags: [],
    byType: [],
    byTypeTags: [],
  };

  return { stats: statResource };
};

const getExpenseList = async (statsBelongsTo: StatBelongsTo, year: number, baseLogger: LoggerBase) => {
  const logger = getLogger("getExpenseList", baseLogger);

  let xpnsBelongsTo: ExpenseBelongsTo;
  if (statsBelongsTo === StatBelongsTo.Purchase) {
    xpnsBelongsTo = ExpenseBelongsTo.Purchase;
  } else if (statsBelongsTo === StatBelongsTo.Refund) {
    xpnsBelongsTo = ExpenseBelongsTo.PurchaseRefund;
  } else if (statsBelongsTo === StatBelongsTo.Income) {
    xpnsBelongsTo = ExpenseBelongsTo.Income;
  } else {
    return [];
  }

  const expenseList = await expenseDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, xpnsBelongsTo);

  logger.debug("filtering expenses by expense date where year is ", year, " for belongsTo =", xpnsBelongsTo);

  const filteredExpenses = expenseList.filter((xpns) => getExpenseDateYear(xpns, logger) === year);

  logger.debug("before filtering, expenseList size=", expenseList.length, ", after filtering expenseList size =", filteredExpenses.length);

  return filteredExpenses;
};
