import { ActionFunctionArgs, json } from "react-router-dom";
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
import { incomeTypeService } from "../../expenses/services";

const rhLogger = getLogger("route.handler.settings.incomeType.loader", null, null, "DISABLED");

export interface IncomeTypeLoaderResource {
  incomeTypes: ConfigResource[];
  tags: string[];
}

export const incomeTypeListLoaderHandler = async () => {
  const logger = getLogger("incomeTypeListLoaderHandler", rhLogger);
  try {
    const incomeTypeList = await incomeTypeService.getList();
    const tags = await incomeTypeService.getTagList();

    const response: RouteHandlerResponse<IncomeTypeLoaderResource, null> = {
      type: "success",
      data: {
        incomeTypes: incomeTypeList,
        tags: tags,
      },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const incomeTypeListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await incomeTypeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await incomeTypeDeleteActionHandler(request);
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

const incomeTypeAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("incomeTypeAddUpdateActionHandler", rhLogger);
  const data = (await request.json()) as UpdateConfigDetailsResource | UpdateConfigStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      await incomeTypeService.addUpdateDetails(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "income type updated",
      };
      return response;
    }
    if (data.action === "updateStatus") {
      await incomeTypeService.updateStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `income type status is updated to ${data.status}`,
      };
      return response;
    }
    const error: RouteHandlerResponse<null, any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating income type",
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

const incomeTypeDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("incomeTypeDeleteActionHandler", rhLogger);
  const data = (await request.json()) as DeleteConfigDetailsResource;

  try {
    await incomeTypeService.deleteIncomeType(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: `income type is deleted`,
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
