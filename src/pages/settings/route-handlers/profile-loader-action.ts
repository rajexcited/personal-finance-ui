import { ActionFunctionArgs, json } from "react-router-dom";
import { AuthenticationService } from "../../auth";
import { HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";
import { CurrencyProfileResource, CurrencyProfileService } from "../services";
import { UpdateUserDetailsResource } from "../../auth/services";

const authenticationService = AuthenticationService();
const currencyProfileService = CurrencyProfileService();

export interface ProfileDetailsLoaderResource {
  nameDetails: UpdateUserDetailsResource;
  currencyProfiles: CurrencyProfileResource[];
}

export const profileDetailsLoaderHandler = async () => {
  const logger = getLogger("route.profileDetailsLoaderHandler");
  try {
    const userDetails = await authenticationService.getUserDetails();
    const currencyProfiles = await currencyProfileService.getCurrencyProfiles();
    const response: RouteHandlerResponse<ProfileDetailsLoaderResource> = {
      type: "success",
      data: {
        nameDetails: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
        },
        currencyProfiles: currencyProfiles,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const profileDetailsActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const data = await request.json();
    if ("nameDetails" in data) {
      return await nameChangedActionHandler(request, data.nameDetails as UpdateUserDetailsResource);
    }
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

const nameChangedActionHandler = async (request: Request, data: UpdateUserDetailsResource) => {
  const logger = getLogger("route.nameChangedActionHandler");
  try {
    await authenticationService.updateName(data);
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: "name of user is updated",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
