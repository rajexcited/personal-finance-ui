import { ActionFunctionArgs, json } from "react-router-dom";
import { AuthenticationService, UserDetailsResource } from "../../auth";
import { HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";
import { UpdateUserPasswordResource } from "../../auth/services";

const authenticationService = AuthenticationService();

export const securityDetailsLoaderHandler = async () => {
  const logger = getLogger("route.securityDetailsLoaderHandler");
  try {
    const userDetails = await authenticationService.getUserDetails();
    const response: RouteHandlerResponse<UserDetailsResource, null> = {
      type: "success",
      data: userDetails,
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const securityDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await detailsChangedActionHandler(request);
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

const detailsChangedActionHandler = async (request: Request) => {
  const logger = getLogger("route.detailsChangedActionHandler");
  try {
    const data = (await request.json()) as UpdateUserPasswordResource;

    await authenticationService.updatePassword(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "user password is updated",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
