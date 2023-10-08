import { PymtAccountService } from "../services";
import { descCompare } from "../../../services";
import { LoaderFunctionArgs, json, redirect } from "react-router-dom";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root/navigation";

const accountService = PymtAccountService();
const authenticationService = AuthenticationService();

export const pymtAccountListLoaderHandler = async () => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }
  try {
    const pymtAccList = await accountService.getPymtAccounts();
    pymtAccList.sort((a, b) => descCompare(a.updatedOn, b.updatedOn));
    return pymtAccList;
  } catch (e) {
    const err = e as Error;
    throw json({ type: "error", errorMessage: err.message }, { status: 500 });
  }
};

export const pymtAccountDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }
  try {
    const details = await accountService.getPymtAccount(params.accountId as string);
    if (!details) throw Error("account details not found");
    return details;
  } catch (e) {
    const err = e as Error;
    throw json({ errorMessage: err.message }, { status: 500 });
  }
};