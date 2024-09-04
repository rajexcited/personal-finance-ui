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
import { PymtAccountFields, PymtAccountService } from "../../../pymt-accounts/services";
import { ConfigTypeStatus } from "../../../../shared";

const pymtAccountService = PymtAccountService();
const rhLogger = getLogger("route.handler.income.loader", null, null, "INFO");

export interface IncomeDetailLoaderResource {
  incomeDetail?: IncomeFields;
  paymentAccounts: PymtAccountFields[];
  incomeTypes: ConfigResource[];
  incomeTags: string[];
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
    const incomeTypes = await incomeTypeService.getList(ConfigTypeStatus.Enable);
    const paymentAccounts = await pymtAccountService.getPymtAccountList();
    const incomeTags = await incomeService.getTags();
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<IncomeDetailLoaderResource, null> = {
      type: "success",
      data: {
        incomeDetail: details,
        paymentAccounts,
        incomeTypes,
        incomeTags,
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
    const incomeTypes = await incomeTypeService.getList(ConfigTypeStatus.Enable);
    const paymentAccounts = await pymtAccountService.getPymtAccountList();
    const incomeTags = await incomeService.getTags();

    const response: RouteHandlerResponse<IncomeDetailLoaderResource, null> = {
      type: "success",
      data: {
        paymentAccounts,
        incomeTypes,
        incomeTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
