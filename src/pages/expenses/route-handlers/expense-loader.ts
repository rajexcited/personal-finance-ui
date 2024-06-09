import { LoaderFunctionArgs } from "react-router-dom";
import { CategoryService, ConfigResource, ExpenseFields, ExpenseService } from "../services";
import { NotFoundError, RouteHandlerResponse, handleRouteActionError } from "../../../services";

const expenseService = ExpenseService();
const categoryService = CategoryService();

export const expenseListLoaderHandler = async () => {
  try {
    const expenseList = await expenseService.getExpenses(1);
    const response: RouteHandlerResponse<ExpenseFields[]> = {
      type: "success",
      data: expenseList,
    };
    return response;
  } catch (e) {
    console.error("in loader handler", e);
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
  try {
    const details = await expenseService.getExpense(params.expenseId as string);
    if (!details) throw new NotFoundError("Expense details not found");

    const categoryTypes = await categoryService.getActiveCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();

    const response: RouteHandlerResponse<ExpenseDetailLoaderResource> = {
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
    console.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const expenseDetailSupportingLoaderHandler = async () => {
  try {
    const categoryTypes = await categoryService.getActiveCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();

    const response: RouteHandlerResponse<ExpenseDetailLoaderResource> = {
      type: "success",
      data: {
        expenseDetail: null,
        paymentAccounts,
        categoryTypes,
        expenseTags,
      },
    };
  } catch (e) {
    console.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
