import { ascCompare, descCompare, getLogger, LoggerBase } from "../../../../shared";
import { ExpenseFields } from "./field-types";
import { ExpenseSortStateType, ExpenseSortDetails } from "./sort-headers";

const rootLogger = getLogger("service.expense.sort-comparator", null, null, "DISABLED");

export const getSortedExpenses = (expenses: ExpenseFields[], sortDetails: ExpenseSortStateType, _logger: LoggerBase) => {
  const logger = getLogger("getSortedExpenses", _logger);
  logger.debug("sortDetails =", sortDetails);
  logger.debug(
    "list before sorting =",
    expenses.map((xp) => xp.id)
  );
  const headers: ExpenseSortDetails[] = [];
  Object.values(sortDetails).forEach((item) => item && headers.push({ ...item }));

  headers.sort((ah, bh) => {
    const asl = ah.sortLevel || 10000;
    const bsl = bh.sortLevel || 10000;
    return asl - bsl;
  });

  const sortingHeaders = headers.filter((hdr) => hdr.sortDirection !== undefined);
  logger.debug("sortingHeaders =", sortingHeaders);
  const sortingExpenses = [...expenses];
  sortingExpenses.sort(expenseComparator.bind(null, headers));
  logger.debug(
    "list after sorting =",
    sortingExpenses.map((xp) => xp.id)
  );

  return sortingExpenses;
};

const expenseComparator = (headers: ExpenseSortDetails[], a: ExpenseFields, b: ExpenseFields) => {
  const logger = getLogger("expenseComparator", rootLogger);
  let diff = 0;

  const getExpenseValue = (sh: ExpenseSortDetails, ab: ExpenseFields) => {
    let k = undefined;
    k = sh.datafieldKey;
    if (k in ab) {
      return ab[k as keyof ExpenseFields];
    }

    k = sh.relatedDatafieldKeys.find((rk) => rk in ab);
    if (k) {
      return ab[k as keyof ExpenseFields];
    }
  };

  for (const sh of headers) {
    if (sh.sortDirection) {
      let aDatafieldValue = getExpenseValue(sh, a);
      let bDatafieldValue = getExpenseValue(sh, b);
      logger.debug(
        "sortDirection =",
        sh.sortDirection,
        "datafieldKey =",
        sh.datafieldKey,
        "aDatafieldValue =",
        aDatafieldValue,
        "bDatafieldValue =",
        bDatafieldValue,
        aDatafieldValue instanceof Date && aDatafieldValue.getTime(),
        bDatafieldValue instanceof Date && bDatafieldValue.getTime()
      );
      if (sh.sortDirection === "desc") {
        diff = descCompare(aDatafieldValue, bDatafieldValue);
      } else {
        diff = ascCompare(aDatafieldValue, bDatafieldValue);
      }
    }
    if (diff !== 0) break;
  }
  logger.debug("diff =", diff);
  return diff;
};
