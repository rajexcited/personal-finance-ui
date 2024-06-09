import { ActionFunctionArgs, json } from "react-router-dom";
import { ExpenseCategoryService } from "../../expenses";
import { ConfigResource, HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../services";

const expenseCategoryService = ExpenseCategoryService();

export const expenseCategoryListLoaderHandler = async () => {
  try {
    const expenseCategoryList = await expenseCategoryService.getCategories();
    const response: RouteHandlerResponse<ConfigResource[]> = {
      type: "success",
      data: expenseCategoryList,
    };

    return response;
  } catch (e) {
    console.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const expenseCategoryListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await expenseCategoryAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseCategoryDeleteActionHandler(request);
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

const expenseCategoryAddUpdateActionHandler = async (request: Request) => {
  const data = await request.json();

  try {
    if ("name" in data) {
      await expenseCategoryService.addUpdateCategory(data);
      const response: RouteHandlerResponse<string> = {
        type: "success",
        data: "expense category updated",
      };
      return response;
    }
    if ("status" in data) {
      await expenseCategoryService.updateCategoryStatus(data);
      const response: RouteHandlerResponse<string> = {
        type: "success",
        data: `expense category status is updated to ${data.status}`,
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

const expenseCategoryDeleteActionHandler = async (request: Request) => {
  const data: ConfigResource = await request.json();

  try {
    await expenseCategoryService.deleteCategory(data.id);
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: `expense category is deleted`,
    };
    return response;
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
