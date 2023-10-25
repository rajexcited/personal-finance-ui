import { LoaderFunctionArgs, json, redirect } from "react-router-dom";
import { ConfigType, PymtAccountFields, PymtAccountService, descCompare } from "../services";
import { AuthenticationService } from "../../auth";
import { PAGE_URL } from "../../root";

const accountService = PymtAccountService();
const authenticationService = AuthenticationService();

export interface PymtAccountDetailLoaderType {
  pymtAccountDetail: PymtAccountFields | null;
  categoryTypes: ConfigType[];
  pymtAccountTags: string[];
}

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

export const pymtAccountDetailLoaderHandler = async ({
  params,
}: LoaderFunctionArgs): Promise<Response | PymtAccountDetailLoaderType> => {
  //
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }
  try {
    const pymtAccountDetail = await accountService.getPymtAccount(params.accountId as string);
    if (!pymtAccountDetail) throw Error("account details not found");
    const pymtAccountTags = await accountService.getPymtAccountTags();
    const categoryTypes = await accountService.getPymtAccountTypes();

    return {
      pymtAccountDetail,
      pymtAccountTags,
      categoryTypes,
    };
  } catch (e) {
    const err = e as Error;
    throw json({ errorMessage: err.message }, { status: 500 });
  }
};

export const pymtAccountDetailSupportingLoaderHandler = async (): Promise<Response | PymtAccountDetailLoaderType> => {
  if (!authenticationService.isAuthenticated()) {
    return redirect(PAGE_URL.loginPage.fullUrl);
  }
  try {
    const pymtAccountTags = await accountService.getPymtAccountTags();
    const categoryTypes = await accountService.getPymtAccountTypes();

    return {
      pymtAccountDetail: null,
      pymtAccountTags,
      categoryTypes,
    };
  } catch (e) {
    const err = e as Error;
    throw json({ errorMessage: err.message }, { status: 500 });
  }
};
