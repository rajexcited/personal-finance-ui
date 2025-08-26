import { ActionFunctionArgs, redirect } from "react-router";
import { getFullPath } from "../../root";
import { getLogger, handleRouteActionError, HttpStatusCode, PymtAccountFields, pymtAccountService, RouteHandlerResponse } from "../services";
import { responseJson } from "../../../shared";

export const pymtAccountActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await pymtAccountAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccountDeleteActionHandler(request);
  }
  const error: RouteHandlerResponse<null, any> = {
    type: "error",
    errorMessage: "action not supported",
    data: {
      request: {
        method: request.method
      }
    }
  };
  return responseJson(error, HttpStatusCode.InternalServerError);
};

const pymtAccountAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("route.pymtAccountAddUpdateActionHandler");
  try {
    const jsondata = await request.json();

    await pymtAccountService.addUpdatePymtAccount(jsondata);

    return redirect(getFullPath("pymtAccountsRoot"));
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const pymtAccountDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("route.pymtAccountDeleteActionHandler");
  try {
    const jsondata = (await request.json()) as PymtAccountFields;
    await pymtAccountService.removePymtAccount(jsondata.id);

    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "payment account is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
