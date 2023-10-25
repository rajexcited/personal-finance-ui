import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { ExpenseService } from "../services";

const expenseService = ExpenseService();

export const expenseActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await expenseAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseDeleteActionHandler(request);
  }
};

const expenseAddUpdateActionHandler = async (request: Request) => {
  const data = await request.json();

  try {
    await expenseService.addUpdateExpense(data);
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }

  return redirect(PAGE_URL.expenseJournalRoot.fullUrl);
};

const expenseDeleteActionHandler = async (request: Request) => {
  try {
    const formdata = await request.formData();
    const expenseId = formdata.get("expenseId") as string;
    await expenseService.removeExpense(expenseId);
    return "deleted";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};
