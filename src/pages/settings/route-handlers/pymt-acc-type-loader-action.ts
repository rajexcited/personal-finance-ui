import { ActionFunctionArgs, json } from "react-router-dom";
import { PymtAccountTypeService } from "../../pymt-accounts";
import { ConfigResource, HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../services";

const pymtAccountTypeService = PymtAccountTypeService();

export const paymentAccountTypeListLoaderHandler = async () => {
  try {
    const pymtAccTypeList = await pymtAccountTypeService.getAccountTypes();
    const response: RouteHandlerResponse<ConfigResource[]> = {
      type: "success",
      data: pymtAccTypeList,
    };

    return response;
  } catch (e) {
    console.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const pymtAccTypeListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await pymtAccTypeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccTypeDeleteActionHandler(request);
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

const pymtAccTypeAddUpdateActionHandler = async (request: Request) => {
  const data = await request.json();

  try {
    if ("name" in data) {
      await pymtAccountTypeService.addUpdateAccountType(data);
      const response: RouteHandlerResponse<string> = {
        type: "success",
        data: "payment account updated",
      };
      return response;
    }
    if ("status" in data) {
      await pymtAccountTypeService.updateAccountTypeStatus(data);
      const response: RouteHandlerResponse<string> = {
        type: "success",
        data: `payment account status is updated to ${data.status}`,
      };
      return response;
    }
    const error: RouteHandlerResponse<any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating expense category",
      data: {
        request: {
          method: request.method,
          data: data,
        },
      },
    };
    return json(error, { status: HttpStatusCode.InternalServerError });
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const pymtAccTypeDeleteActionHandler = async (request: Request) => {
  const data: ConfigResource = await request.json();

  try {
    await pymtAccountTypeService.deleteAccountType(data.id);
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: `payment account is deleted`,
    };
    return response;
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
