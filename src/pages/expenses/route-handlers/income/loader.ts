import { LoaderFunctionArgs } from "react-router-dom";
import {
  ConfigResource,
  getLogger,
  RouteHandlerResponse,
  NotFoundError,
  handleRouteActionError,
  IncomeFields,
  incomeService,
  incomeTypeService,
} from "../../services";
import { PymtAccountFields, pymtAccountService } from "../../../pymt-accounts/services";
import { ConfigTypeStatus } from "../../../../shared";
import { CurrencyProfileResource, currencyProfileService, SharePersonResource, sharePersonService } from "../../../settings/services";

const rhLogger = getLogger("route.handler.income.loader", null, null, "DISABLED");

export interface IncomeDetailLoaderResource {
  incomeDetail?: IncomeFields;
  paymentAccounts: PymtAccountFields[];
  incomeTypes: ConfigResource[];
  incomeTags: string[];
  sharePersons: SharePersonResource[];
  currencyProfiles: CurrencyProfileResource[];
}

export const modifyIncomeDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("modifyIncomeDetailLoaderHandler", rhLogger);

  try {
    logger.debug("fetching income details, params =", params);
    const details = await incomeService.getDetails(params.incomeId as string);
    logger.debug("retrieved income details are", details);
    // this error should never have to handle because it should be thrown by rest api call
    if (!details) throw new NotFoundError("Income details not found");

    logger.debug("fetching other info");
    const incomeTypesPromise = incomeTypeService.getList(ConfigTypeStatus.Enable);
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const incomeTagsPromise = incomeService.getTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([incomeTypesPromise, paymentAccountsPromise, incomeTagsPromise, sharePersonsPromise, currencyProfilePromise]);
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<IncomeDetailLoaderResource, null> = {
      type: "success",
      data: {
        incomeDetail: details,
        paymentAccounts: await paymentAccountsPromise,
        incomeTypes: await incomeTypesPromise,
        incomeTags: await incomeTagsPromise,
        sharePersons: await sharePersonsPromise,
        currencyProfiles: await currencyProfilePromise,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const addIncomeDetailLoaderHandler = async () => {
  const logger = getLogger("addIncomeDetailLoaderHandler", rhLogger);
  try {
    const incomeTypesPromise = incomeTypeService.getList(ConfigTypeStatus.Enable);
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const incomeTagsPromise = incomeService.getTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();
    await Promise.all([incomeTypesPromise, paymentAccountsPromise, incomeTagsPromise, sharePersonsPromise, currencyProfilePromise]);

    const response: RouteHandlerResponse<IncomeDetailLoaderResource, null> = {
      type: "success",
      data: {
        paymentAccounts: await paymentAccountsPromise,
        incomeTypes: await incomeTypesPromise,
        incomeTags: await incomeTagsPromise,
        sharePersons: await sharePersonsPromise,
        currencyProfiles: await currencyProfilePromise,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
