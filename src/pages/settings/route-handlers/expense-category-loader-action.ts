import { ActionFunctionArgs, json } from "react-router-dom";
import { ExpenseCategoryService } from "../../expenses";
import {
  ConfigResource,
  DeleteConfigDetailsResource,
  HttpStatusCode,
  RouteHandlerResponse,
  UpdateConfigDetailsResource,
  UpdateConfigStatusResource,
  getLogger,
  handleRouteActionError,
} from "../../../services";

const expenseCategoryService = ExpenseCategoryService();

export interface ExpenseCategoryTypeLoaderResource {
  categoryTypes: ConfigResource[];
  categoryTags: string[];
}

export const expenseCategoryListLoaderHandler = async () => {
  const logger = getLogger("route.expenseCategoryListLoaderHandler");
  try {
    const expenseCategoryList = await expenseCategoryService.getCategories();
    const expenseCategoryTags = await expenseCategoryService.getCategoryTags();

    const response: RouteHandlerResponse<ExpenseCategoryTypeLoaderResource, null> = {
      type: "success",
      data: {
        categoryTypes: expenseCategoryList,
        categoryTags: expenseCategoryTags,
      },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const expenseCategoryListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await expenseCategoryAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseCategoryDeleteActionHandler(request);
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

const expenseCategoryAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("route.expenseCategoryAddUpdateActionHandler");
  const data = (await request.json()) as UpdateConfigDetailsResource | UpdateConfigStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      await expenseCategoryService.addUpdateCategory(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "expense category updated",
      };
      return response;
    }
    if (data.action === "updateStatus") {
      await expenseCategoryService.updateCategoryStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `expense category status is updated to ${data.status}`,
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

const expenseCategoryDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("route.expenseCategoryDeleteActionHandler");
  const data = (await request.json()) as DeleteConfigDetailsResource;

  try {
    await expenseCategoryService.deleteCategory(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: `expense category is deleted`,
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
