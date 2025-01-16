import { getDateInstance, LoggerBase } from "../../../../shared";
import { ExpenseBelongsTo, ExpenseFields } from "./field-types";

export const getExpenseDateInstance = (expense: ExpenseFields, logger: LoggerBase) => {
  let dateStr = null;
  if (expense.belongsTo === ExpenseBelongsTo.Purchase) {
    dateStr = expense.purchaseDate;
  } else if (expense.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
    dateStr = expense.refundDate;
  } else if (expense.belongsTo === ExpenseBelongsTo.Income) {
    dateStr = expense.incomeDate;
  }

  if (!dateStr) {
    logger.debug("expense date is not found");
    return null;
  }

  return getDateInstance(dateStr);
};
