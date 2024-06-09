import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { PymtAccountService } from "../services";
import { HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../services";

const pymtAccountService = PymtAccountService();

export const pymtAccountActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await pymtAccountAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccountDeleteActionHandler(request);
  }
  const error: RouteHandlerResponse<any> = {
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
  try {
    const formdata = await request.formData();
    const data: any = {};

    data.accountId = formdata.get("accountId");
    data.shortName = formdata.get("shortName");
    data.accountName = formdata.get("accountName");
    data.accountNumber = formdata.get("accountNumber");
    if (formdata.get("typeId")) data.typeId = formdata.get("typeId");
    if (formdata.get("typeName")) data.typeName = formdata.get("typeName");
    data.tags = formdata.get("tags");
    data.institutionName = formdata.get("institutionName");
    data.description = formdata.get("description");
    if (formdata.get("icon")) data.icon = formdata.get("icon");

    await pymtAccountService.addUpdatePymtAccount(data);
    return redirect(PAGE_URL.pymtAccountsRoot.fullUrl);
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const pymtAccountDeleteActionHandler = async (request: Request) => {
  try {
    const formdata = await request.formData();
    const accountId = formdata.get("accountId") as string;
    await pymtAccountService.removePymtAccount(accountId);

    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: "payment account is deleted",
    };
    return response;
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
