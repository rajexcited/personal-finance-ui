import { getLogger, handleRouteActionError, RouteHandlerResponse } from "../../../shared";
import { authService } from "../../auth";
import { CountryResource } from "../services/field-types";

export interface SignupDetailsLoaderResource {
  countryList: CountryResource[];
}

const rhLogger = getLogger("route.handler.auth.loader", null, null, "DISABLED");

export const signupDetailsLoaderHandler = async () => {
  const logger = getLogger("signupDetailsLoaderHandler", rhLogger);
  try {
    const countryList = await authService.getCountryList();
    const response: RouteHandlerResponse<SignupDetailsLoaderResource, null> = {
      type: "success",
      data: {
        countryList: countryList,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
