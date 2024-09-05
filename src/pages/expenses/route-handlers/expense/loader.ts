import { ExpenseFields, expenseService, ExpenseStatus, getLogger, handleRouteActionError, RouteHandlerResponse } from "../../services";

const rhLogger = getLogger("route.handler.expense.loader", null, null, "DISABLED");

export const expenseListLoaderHandler = async () => {
  const logger = getLogger("expenseListLoaderHandler", rhLogger);
  try {
    const expenseList = await expenseService.getExpenseList(1, ExpenseStatus.Enable, 6);
    const response: RouteHandlerResponse<ExpenseFields[], null> = {
      type: "success",
      data: expenseList,
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
