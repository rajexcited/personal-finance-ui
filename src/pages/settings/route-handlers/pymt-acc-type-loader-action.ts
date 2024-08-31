import { ActionFunctionArgs, json } from "react-router-dom";
import { pymtAccountTypeService } from "../../pymt-accounts";
import { ConfigResource, HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../services";

export interface PymtAccTypeLoaderResource {
  pymtAccTypes: ConfigResource[];
  pymtAccTags: string[];
}

export const paymentAccountTypeListLoaderHandler = async () => {
  const logger = getLogger("route.paymentAccountTypeListLoaderHandler");
  try {
    const pymtAccTypeList = await pymtAccountTypeService.getAccountTypes();
    const pymtAccTags = await pymtAccountTypeService.getPymtAccTypeTags();

    const response: RouteHandlerResponse<PymtAccTypeLoaderResource, null> = {
      type: "success",
      data: {
        pymtAccTypes: pymtAccTypeList,
        pymtAccTags: pymtAccTags,
      },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const pymtAccTypeListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await pymtAccTypeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await pymtAccTypeDeleteActionHandler(request);
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

const pymtAccTypeAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("route.pymtAccTypeAddUpdateActionHandler");
  const data = await request.json();

  try {
    if ("name" in data) {
      await pymtAccountTypeService.addUpdateAccountType(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "payment account updated",
      };
      return response;
    }
    if ("status" in data) {
      await pymtAccountTypeService.updateAccountTypeStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `payment account status is updated to ${data.status}`,
      };
      return response;
    }
    const error: RouteHandlerResponse<null, any> = {
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
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const pymtAccTypeDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("route.pymtAccTypeDeleteActionHandler");
  const data: ConfigResource = await request.json();

  try {
    await pymtAccountTypeService.deleteAccountType(data.id);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: `payment account is deleted`,
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
