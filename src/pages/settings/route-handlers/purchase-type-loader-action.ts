import { ActionFunctionArgs, json } from "react-router-dom";
import { PurchaseTypeService } from "../../expenses";
import {
  ConfigResource,
  DeleteConfigDetailsResource,
  HttpStatusCode,
  RouteHandlerResponse,
  UpdateConfigDetailsResource,
  UpdateConfigStatusResource,
  getLogger,
  handleRouteActionError,
} from "../services";

const purchaseTypeService = PurchaseTypeService();
const rhLogger = getLogger("route.handler.settings.purchaseType.loader", null, null, "DISABLED");

export interface PurchaseTypeLoaderResource {
  purchaseTypes: ConfigResource[];
  purchaseTags: string[];
}

export const purchaseTypeListLoaderHandler = async () => {
  const logger = getLogger("purchaseTypeListLoaderHandler", rhLogger);
  try {
    const purchaseTypeList = await purchaseTypeService.getTypes();
    const purchaseTypeTags = await purchaseTypeService.getTags();

    const response: RouteHandlerResponse<PurchaseTypeLoaderResource, null> = {
      type: "success",
      data: {
        purchaseTypes: purchaseTypeList,
        purchaseTags: purchaseTypeTags,
      },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const purchaseTypeListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await purchaseTypeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await purchaseTypeDeleteActionHandler(request);
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

const purchaseTypeAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("purchaseTypeAddUpdateActionHandler", rhLogger);
  const data = (await request.json()) as UpdateConfigDetailsResource | UpdateConfigStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      await purchaseTypeService.addUpdateType(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "purchase type updated",
      };
      return response;
    }
    if (data.action === "updateStatus") {
      await purchaseTypeService.updateTypeStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `purchase type status is updated to ${data.status}`,
      };
      return response;
    }
    const error: RouteHandlerResponse<null, any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating purchase type",
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

const purchaseTypeDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("purchaseTypeDeleteActionHandler", rhLogger);
  const data = (await request.json()) as DeleteConfigDetailsResource;

  try {
    await purchaseTypeService.deleteType(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: `purchase type is deleted`,
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
