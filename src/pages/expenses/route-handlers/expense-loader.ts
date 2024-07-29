import { LoaderFunctionArgs } from "react-router-dom";
import { ConfigResource, ExpenseFields, ExpenseService } from "../services";
import { NotFoundError, RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";

const expenseService = ExpenseService();

export const expenseListLoaderHandler = async () => {
  const logger = getLogger("route.expenseListLoaderHandler");
  try {
    const expenseList = await expenseService.getExpenseList(1);
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

export interface ExpenseDetailLoaderResource {
  expenseDetail: ExpenseFields | null;
  paymentAccounts: Map<string, string>;
  categoryTypes: ConfigResource[];
  expenseTags: string[];
}

export const expenseDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("route.expenseDetailLoaderHandler");
  try {
    logger.debug("fetching expense details, params =", params);
    const details = await expenseService.getExpense(params.expenseId as string);
    logger.debug("retrieved expense details are", details);
    // this error should never have to handle because it should be thrown by rest api call
    if (!details) throw new NotFoundError("Expense details not found");

    logger.debug("fetching other info");
    const categoryTypes = await expenseService.getExpenseCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<ExpenseDetailLoaderResource, null> = {
      type: "success",
      data: {
        expenseDetail: details,
        paymentAccounts,
        categoryTypes,
        expenseTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const expenseDetailSupportingLoaderHandler = async () => {
  const logger = getLogger("route.expenseDetailSupportingLoaderHandler");
  try {
    const categoryTypes = await expenseService.getExpenseCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();

    const response: RouteHandlerResponse<ExpenseDetailLoaderResource, null> = {
      type: "success",
      data: {
        expenseDetail: null,
        paymentAccounts,
        categoryTypes,
        expenseTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
