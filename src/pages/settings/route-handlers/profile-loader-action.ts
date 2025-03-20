import { ActionFunctionArgs, json } from "react-router-dom";
import { authService, UpdateUserDetailsResource } from "../../auth";
import { HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError, CurrencyProfileResource, currencyProfileService } from "../services";

export interface ProfileDetailsLoaderResource {
  nameDetails: UpdateUserDetailsResource;
  emailId: string;
  currencyProfiles: CurrencyProfileResource[];
}

export const profileDetailsLoaderHandler = async () => {
  const logger = getLogger("route.profileDetailsLoaderHandler");
  try {
    const userDetails = await authService.getUserDetails();
    const currencyProfiles = await currencyProfileService.getCurrencyProfiles();
    const response: RouteHandlerResponse<ProfileDetailsLoaderResource, null> = {
      type: "success",
      data: {
        nameDetails: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName
        },
        emailId: userDetails.emailId,
        currencyProfiles: currencyProfiles
      }
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const profileDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const data = (await request.json()) as UpdateUserDetailsResource;
    return await nameChangedActionHandler(request, data);
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
  return json(error, { status: HttpStatusCode.InternalServerError });
};

const nameChangedActionHandler = async (request: Request, data: UpdateUserDetailsResource) => {
  const logger = getLogger("route.nameChangedActionHandler");
  try {
    await authService.updateName(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "name of user is updated"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
