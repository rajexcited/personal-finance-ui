import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { PymtAccountFields, PymtAccountService } from "../services";
import { HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";

const pymtAccountService = PymtAccountService();

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
        method: request.method,
      },
    },
  };
  return json(error, { status: HttpStatusCode.InternalServerError });
};

const pymtAccountAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("route.pymtAccountAddUpdateActionHandler");
  try {
    const jsondata = await request.json();

    await pymtAccountService.addUpdatePymtAccount(jsondata);

    return redirect(PAGE_URL.pymtAccountsRoot.fullUrl);
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
      data: "payment account is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
