import { ActionFunctionArgs, json } from "react-router-dom";
import { AuthenticationService, UserDetailsResource } from "../../auth";
import { HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../services";

const authenticationService = AuthenticationService();

export const securityDetailsLoaderHandler = async () => {
  try {
    const userDetails = await authenticationService.getUserDetails();
    const response: RouteHandlerResponse<UserDetailsResource> = {
      type: "success",
      data: userDetails,
    };
    return response;
  } catch (e) {
    console.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const securityDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await detailsChangedActionHandler(request);
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

const detailsChangedActionHandler = async (request: Request) => {
  try {
    const data = await request.json();

    await authenticationService.updatePassword({
      password: data.password,
      newPassword: data.newPassword,
    });
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: "user password is updated",
    };
    return response;
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
