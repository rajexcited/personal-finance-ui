import { HttpStatusCode } from "axios";
import { redirect } from "react-router";
import { getFullPath } from "../../pages";
import { cleanupSession } from "../../pages/auth/services/auth-storage";
import { BadRequestError, ValidationErrorData, RestError, UnauthorizedError, NotFoundError } from "./rest-error-utils";

interface RouteHandlerErrorResponse<T> {
  type: "error";
  errorMessage: string;
  data: T;
}

interface RouteHandlerSuccessResponse<T> {
  type: "success";
  data: T;
}

export type RouteHandlerResponse<S, E> = RouteHandlerSuccessResponse<S> | RouteHandlerErrorResponse<E>;

export const handleRouteActionError = (e: unknown, overrideMessages?: Record<string, string>) => {
  if (e instanceof UnauthorizedError) {
    if (overrideMessages && HttpStatusCode.Unauthorized in overrideMessages) {
      const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: "", data: null };
      overrideResponseError(response, overrideMessages, e);
      return responseJson(response, e.httpStatusCode);
    }
    cleanupSession();
    return redirect(getFullPath("loginPage"));
  }
  if (e instanceof BadRequestError) {
    const err = e as BadRequestError;
    const response: RouteHandlerErrorResponse<ValidationErrorData[]> = { type: "error", errorMessage: err.message, data: err.jsonData };
    overrideResponseError(response, overrideMessages, err);
    return responseJson(response, err.httpStatusCode);
  }
  if (e instanceof NotFoundError) {
    const err = e as NotFoundError;
    const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
    overrideResponseError(response, overrideMessages, err);
    return responseJson(response, err.httpStatusCode);
  }
  const err = e as RestError;
  const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
  overrideResponseError(response, overrideMessages, err);
  return responseJson(response, HttpStatusCode.InternalServerError);
};

export const getDefaultIfError = async <T>(fn: () => Promise<T>, defaultValue: T) => {
  try {
    return await fn();
  } catch (ignore) {
    return defaultValue;
  }
};

const overrideResponseError = (
  response: RouteHandlerErrorResponse<unknown>,
  overrideMessages: Record<string, string> | undefined,
  err: RestError
) => {
  const httpStatusCode = err.httpStatusCode || HttpStatusCode.InternalServerError;

  let overridenErrorMessage = null;
  if (overrideMessages) {
    if (overrideMessages[httpStatusCode]) {
      overridenErrorMessage = overrideMessages[httpStatusCode];
    } else if (overrideMessages.default) {
      overridenErrorMessage = overrideMessages.default;
    }
  }
  if (overridenErrorMessage) {
    response.data = response.data || response.errorMessage;
    response.errorMessage = overridenErrorMessage;
  }
};

export const responseJson = (resp: Object, httpStatus: HttpStatusCode) => {
  return new Response(JSON.stringify(resp), { status: httpStatus });
};
