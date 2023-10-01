import { ascCompare, descCompare } from "../../../../../services";
import { ExpenseFields } from "../field-types";
import { ExpenseSortStateType, ExpenseSortDetails } from "./sort-headers";

export const expenseComparator = (sortableHeaders: ExpenseSortStateType, a: ExpenseFields, b: ExpenseFields) => {
  let diff = 0;
  const headers: ExpenseSortDetails[] = [];
  Object.values(sortableHeaders).forEach((item) => item && headers.push(item));

  headers.sort((ah, bh) => {
    const asl = ah.sortLevel || 10000;
    const bsl = bh.sortLevel || 10000;
    return asl - bsl;
  });
  for (const sh of headers) {
    if (sh.sortDirection) {
      if (sh.sortDirection === "desc") {
        diff = descCompare(a[sh.datafieldKey], b[sh.datafieldKey]);
      } else {
        diff = ascCompare(a[sh.datafieldKey], b[sh.datafieldKey]);
      }
    }
    if (diff !== 0) break;
  }
  return diff;
};
