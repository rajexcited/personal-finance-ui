import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root";
import { ExpenseCategoryService } from "../../expenses";
import { ConfigType } from "../../../services";

const authenticationService = AuthenticationService();

export const securityDetailsLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }

  try {
    const securityDetails = await authenticationService.getSecutiyDetails();
    return securityDetails;
  } catch (e) {
    const err = e as Error;
    console.log("error", e);
    throw json({ type: "error", errorMessage: err.message }, { status: 500 });
  }
};

export const securityDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (!authenticationService.isAuthenticated()) {
    return json({ type: "error", errorMessage: "You have been logged out, this cannot be saved." }, { status: 500 });
  }
  if (request.method === "POST") {
    return await detailsChangedActionHandler(request);
  }
};

const detailsChangedActionHandler = async (request: Request) => {
  try {
    const formData = await request.formData();
    await authenticationService.updateSecurityDetails({
      password: formData.get("currentPasssword") as string,
      newPassword: formData.get("newPassword") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
    });
    return "success";
  } catch (e) {
    const err = e as Error;
    return json({ errorMessage: err.message }, { status: 500 });
  }
};
