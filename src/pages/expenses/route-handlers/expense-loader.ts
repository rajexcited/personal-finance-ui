import { LoaderFunctionArgs, json, redirect } from "react-router-dom";
import { CategoryService, ConfigType, ExpenseFields, ExpenseService } from "../services";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root";

const expenseService = ExpenseService();
const categoryService = CategoryService();
const authenticationService = AuthenticationService();

export interface ExpenseDetailLoaderType {
  expenseDetail: ExpenseFields | null;
  categoryTypes: ConfigType[];
  paymentAccounts: Map<string, string>;
  expenseTags: string[];
}

export const expenseListLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }
  try {
    const expenseList = await expenseService.getExpenses();
    return expenseList;
  } catch (e) {
    const err = e as Error;
    throw json({ type: "error", errorMessage: err.message }, { status: 500 });
  }
};

export const expenseDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }

  try {
    const details = await expenseService.getExpense(params.expenseId as string);
    if (!details) throw Error("Expense details not found");

    const categoryTypes = await categoryService.getCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();

    return {
      expenseDetail: details,
      paymentAccounts,
      categoryTypes,
      expenseTags,
    };
  } catch (e) {
    const err = e as Error;
    throw json({ errorMessage: err.message }, { status: 500 });
  }
};

export const expenseDetailSupportingLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }

  try {
    const categoryTypes = await categoryService.getCategories();
    const paymentAccounts = await expenseService.getPaymentAccountMap();
    const expenseTags = await expenseService.getExpenseTags();

    return {
      expenseDetail: null,
      paymentAccounts,
      categoryTypes,
      expenseTags,
    };
  } catch (e) {
    const err = e as Error;
    throw json({ errorMessage: err.message }, { status: 500 });
  }
};
