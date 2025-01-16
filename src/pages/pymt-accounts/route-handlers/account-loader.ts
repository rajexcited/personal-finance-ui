import { LoaderFunctionArgs } from "react-router-dom";
import {
  ConfigResource,
  PymtAccountFields,
  pymtAccountService,
  descCompare,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
} from "../services";
import { CurrencyProfileResource, currencyProfileService } from "../../settings/services";

export interface PymtAccountDetailLoaderResource {
  pymtAccountDetail: PymtAccountFields | null;
  categoryTypes: ConfigResource[];
  pymtAccountTags: string[];
  currencyProfiles: CurrencyProfileResource[];
}

export const pymtAccountListLoaderHandler = async () => {
  const logger = getLogger("route.pymtAccountListLoaderHandler");
  try {
    const pymtAccList = await pymtAccountService.getPymtAccountList();
    pymtAccList.sort((a, b) => descCompare(a.auditDetails.updatedOn, b.auditDetails.updatedOn));
    const response: RouteHandlerResponse<PymtAccountFields[], null> = {
      type: "success",
      data: pymtAccList,
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const pymtAccountDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("route.pymtAccountDetailLoaderHandler");
  try {
    const pymtAccountDetail = await pymtAccountService.getPymtAccount(params.accountId as string);
    if (!pymtAccountDetail) throw Error("account details not found");
    const pymtAccountTagsPromise = pymtAccountService.getPymtAccountTags();
    const categoryTypesPromise = pymtAccountService.getPymtAccountTypes();
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([pymtAccountTagsPromise, categoryTypesPromise, currencyProfilePromise]);

    const response: RouteHandlerResponse<PymtAccountDetailLoaderResource, null> = {
      type: "success",
      data: {
        pymtAccountDetail,
        pymtAccountTags: await pymtAccountTagsPromise,
        categoryTypes: await categoryTypesPromise,
        currencyProfiles: await currencyProfilePromise,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const pymtAccountDetailSupportingLoaderHandler = async () => {
  const logger = getLogger("route.pymtAccountDetailSupportingLoaderHandler");
  try {
    const pymtAccountTagsPromise = pymtAccountService.getPymtAccountTags();
    const categoryTypesPromise = pymtAccountService.getPymtAccountTypes();
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([pymtAccountTagsPromise, categoryTypesPromise, currencyProfilePromise]);

    const response: RouteHandlerResponse<PymtAccountDetailLoaderResource, null> = {
      type: "success",
      data: {
        pymtAccountDetail: null,
        pymtAccountTags: await pymtAccountTagsPromise,
        categoryTypes: await categoryTypesPromise,
        currencyProfiles: await currencyProfilePromise,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
