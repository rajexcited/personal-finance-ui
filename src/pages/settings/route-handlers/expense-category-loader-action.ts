import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root";
import { ExpenseCategoryService } from "../../expenses";
import { ConfigType } from "../../../services";

const authenticationService = AuthenticationService();
const expenseCategoryService = ExpenseCategoryService();

export const expenseCategoryListLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }

  try {
    const expenseCategoryList = await expenseCategoryService.getCategories();
    return expenseCategoryList;
  } catch (e) {
    const err = e as Error;
    throw json({ type: "error", errorMessage: err.message }, { status: 500 });
  }
};

export const expenseCategoryListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (!authenticationService.isAuthenticated()) {
    return json({ type: "error", errorMessage: "You have been logged out, this cannot be saved." }, { status: 500 });
  }
  if (request.method === "POST") {
    return await expenseCategoryAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseCategoryDeleteActionHandler(request);
  }
};

const expenseCategoryAddUpdateActionHandler = async (request: Request) => {
  const data = await request.json();

  try {
    await expenseCategoryService.addUpdateCategory(data);
    return "success";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};

const expenseCategoryDeleteActionHandler = async (request: Request) => {
  const data: ConfigType = await request.json();

  try {
    await expenseCategoryService.deleteCategory(data.configId);
    return "success";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};
