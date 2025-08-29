import { ActionFunctionArgs } from "react-router";
import { authService, UpdateUserPasswordResource, UserDetailsResource } from "../../auth";
import { ActionRelation, HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../services";
import { UserLoginResource } from "../../auth/services";
import { responseJson } from "../../../shared";

export const securityDetailsLoaderHandler = async () => {
  const logger = getLogger("route.securityDetailsLoaderHandler");
  try {
    const userDetails = await authService.getUserDetails();
    const response: RouteHandlerResponse<UserDetailsResource, null> = {
      type: "success",
      data: userDetails
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const securityDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const data = await request.json();
    if (data.type === ActionRelation.ChangePassword) {
      return await detailsChangedActionHandler(data as UpdateUserPasswordResource);
    }
    if (data.type === ActionRelation.DeleteAccount) {
      return await deleteUserAccountActionHandler(data as UserLoginResource);
    }
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

const detailsChangedActionHandler = async (data: UpdateUserPasswordResource) => {
  const logger = getLogger("route.detailsChangedActionHandler");
  try {
    await authService.updatePassword(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "user password is updated"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const deleteUserAccountActionHandler = async (data: UserLoginResource) => {
  const logger = getLogger("route.deleteUserAccountActionHandler");
  try {
    await authService.deleteUserAccount(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "user account deletion request is submitted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
