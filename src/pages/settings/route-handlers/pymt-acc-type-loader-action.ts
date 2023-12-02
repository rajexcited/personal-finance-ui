import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root";
import { PymtAccountTypeService } from "../../pymt-accounts";
import { ConfigType } from "../../../services";

const authenticationService = AuthenticationService();
const pymtAccountTypeService = PymtAccountTypeService();

export const paymentAccountTypeListLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }

  try {
    const pymtAccTypeList = await pymtAccountTypeService.getAccountTypes();
    return pymtAccTypeList;
  } catch (e) {
    const err = e as Error;
    throw json({ type: "error", errorMessage: err.message }, { status: 500 });
  }
};

export const pymtAccTypeListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (!authenticationService.isAuthenticated()) {
    return json({ type: "error", errorMessage: "You have been logged out, this cannot be saved." }, { status: 500 });
  }
  if (request.method === "POST") {
    return await pymtAccTypeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccTypeDeleteActionHandler(request);
  }
};

const pymtAccTypeAddUpdateActionHandler = async (request: Request) => {
  const data = await request.json();

  try {
    await pymtAccountTypeService.addUpdateAccountType(data);
    return "success";
  } catch (e) {
    const err = e as Error;
    return json({ errorMessage: err.message }, { status: 500 });
  }
};

const pymtAccTypeDeleteActionHandler = async (request: Request) => {
  const data: ConfigType = await request.json();

  try {
    await pymtAccountTypeService.deleteAccountType(data.configId);
    return "success";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};
