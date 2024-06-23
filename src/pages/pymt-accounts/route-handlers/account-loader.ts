import { LoaderFunctionArgs } from "react-router-dom";
import { ConfigResource, PymtAccountFields, PymtAccountService, descCompare } from "../services";
import { RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";

const accountService = PymtAccountService();

export interface PymtAccountDetailLoaderResource {
  pymtAccountDetail: PymtAccountFields | null;
  categoryTypes: ConfigResource[];
  pymtAccountTags: string[];
}

export const pymtAccountListLoaderHandler = async () => {
  const logger = getLogger("route.pymtAccountListLoaderHandler");
  try {
    const pymtAccList = await accountService.getPymtAccounts();
    pymtAccList.sort((a, b) => descCompare(a.auditDetails.updatedOn, b.auditDetails.updatedOn));
    const response: RouteHandlerResponse<PymtAccountFields[]> = {
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
    const pymtAccountDetail = await accountService.getPymtAccount(params.accountId as string);
    if (!pymtAccountDetail) throw Error("account details not found");
    const pymtAccountTags = await accountService.getPymtAccountTags();
    const categoryTypes = await accountService.getPymtAccountTypes();

    const response: RouteHandlerResponse<PymtAccountDetailLoaderResource> = {
      type: "success",
      data: {
        pymtAccountDetail,
        pymtAccountTags,
        categoryTypes,
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
    const pymtAccountTags = await accountService.getPymtAccountTags();
    const categoryTypes = await accountService.getPymtAccountTypes();

    const response: RouteHandlerResponse<PymtAccountDetailLoaderResource> = {
      type: "success",
      data: {
        pymtAccountDetail: null,
        pymtAccountTags,
        categoryTypes,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
