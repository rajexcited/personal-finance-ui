import axios from "axios";
import { json, redirect } from "react-router-dom";
import { LoggerBase, getLogger } from "./logger";
import { getFullPath } from "../../pages";

export { HttpStatusCode } from "axios";

export class InvalidError extends Error {}

export class RestError extends Error {}

export class UnauthorizedError extends RestError {
  public readonly name = "UnauthorizedError";
  public readonly httpStatusCode = axios.HttpStatusCode.Unauthorized;
}

export class NotFoundError extends RestError {
  public readonly name = "NotFoundError";
  public readonly httpStatusCode = axios.HttpStatusCode.NotFound;
}

interface ValidationErrorData {
  path?: string;
  message: string;
}

class BadRequestError extends RestError {
  public readonly name = "BadRequestError";
  public readonly httpStatusCode = axios.HttpStatusCode.BadRequest;
  public readonly jsonData: ValidationErrorData[];

  constructor(jsonData: ValidationErrorData[], message?: string, cause?: Error) {
    super(message, { cause: cause });
    this.jsonData = jsonData;
  }
}

export const handleRestErrors = (e: Error, loggerBase: LoggerBase) => {
  if (axios.isAxiosError(e)) {
    const logger = getLogger("handleRestErrors", loggerBase);

    logger.warn("rest call has errors: ", e, e.toJSON(), e.response, e.request, e.cause);
    logger.debug("rest call details, ", "config =", e.config, ", response json =", e.toJSON(), ", response =", e.response, "request =", e.request);

    if (e.response?.status === axios.HttpStatusCode.BadRequest) {
      // validation error
      let err: BadRequestError = new BadRequestError([], "invalid data");
      if (e.response.data.message) {
        err = new BadRequestError([{ message: e.response.data.message }], e.response.data.message);
      } else if (e.response.data.Message) {
        err = new BadRequestError([{ message: e.response.data.Message }], e.response.data.Message);
      } else if (Array.isArray(e.response.data) && e.response.data.length > 0) {
        const msg = (e.response.data as ValidationErrorData[]).map((err) => `${err.path} - ${err.message}`).join("\n\n");
        err = new BadRequestError(e.response.data, msg);
      } else {
        err = new BadRequestError([{ message: String(e.response.data) }], "unknown error " + String(e.response.data));
      }

      logger.debug("throwing error", err);
      throw err;
    } else if (e.response?.status === axios.HttpStatusCode.Unauthorized || e.response?.status === axios.HttpStatusCode.Forbidden) {
      const msg = "unauthorized user access";
      const err = new UnauthorizedError(msg);

      logger.debug("throwing error", err);
      throw err;
    } else if (e.response?.status === axios.HttpStatusCode.NotFound) {
      const msg = e.response.data;
      const err = new NotFoundError(msg);

      logger.debug("throwing error", err);
      throw err;
    } else {
      const err = Error("Unknown error: " + (e.response?.data || e.cause));

      logger.debug("throwing error", err);
      throw err;
    }
  }
};

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

export const handleRouteActionError = (e: unknown) => {
  if (e instanceof UnauthorizedError) {
    return redirect(getFullPath("loginPage"));
  }
  if (e instanceof BadRequestError) {
    const err = e as BadRequestError;
    const response: RouteHandlerErrorResponse<ValidationErrorData[]> = { type: "error", errorMessage: err.message, data: err.jsonData };
    return json(response, { status: err.httpStatusCode });
  }
  if (e instanceof NotFoundError) {
    const err = e as NotFoundError;
    const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
    return json(response, { status: err.httpStatusCode });
  }
  const err = e as Error;
  const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
  return json(response, { status: axios.HttpStatusCode.InternalServerError });
};

export const getDefaultIfError = async <T>(fn: () => Promise<T>, defaultValue: T) => {
  try {
    return await fn();
  } catch (ignore) {
    return defaultValue;
  }
};

export const handleAndRethrowServiceError = (e: Error, logger: LoggerBase) => {
  const err = e as Error;
  handleRestErrors(err, logger);
  logger.warn("not rest error", e);
  let errorMessage = e.name ? e.name + ": " : "";
  errorMessage += e.message ? e.message : "unknown error";
  throw Error(errorMessage);
};
