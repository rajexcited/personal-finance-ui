import { ExpenseService, getLogger, handleRouteActionError, RouteHandlerResponse } from "../services";
import { PurchaseFields } from "../services";

const expenseService = ExpenseService();
const rhLogger = getLogger("route.handler.expense.loader", null, null, "INFO");

export const expenseListLoaderHandler = async () => {
  const logger = getLogger("expenseListLoaderHandler", rhLogger);
  try {
    const expenseList = await expenseService.getExpenseList(1);
    const response: RouteHandlerResponse<PurchaseFields[], null> = {
      type: "success",
      data: expenseList,
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
