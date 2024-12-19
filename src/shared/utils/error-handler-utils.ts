import { HttpStatusCode, isAxiosError } from "axios";
import { json, redirect } from "react-router-dom";
import { LoggerBase, getLogger } from "./logger";
import { getFullPath } from "../../pages";

export { HttpStatusCode } from "axios";

export class InvalidError extends Error {}

export class RestError extends Error {
  public readonly httpStatusCode;

  constructor(httpStatusCode?: HttpStatusCode, message?: string, cause?: Error) {
    super(message, { cause: cause });
    this.httpStatusCode = httpStatusCode || HttpStatusCode.ServiceUnavailable;
  }
}

export class UnauthorizedError extends RestError {
  public readonly name = "UnauthorizedError";

  constructor(message?: string, cause?: Error) {
    super(HttpStatusCode.Unauthorized, message, cause);
  }
}

export class UnknownError extends RestError {
  public readonly name = "UnknownError";

  constructor(message?: string, cause?: Error) {
    super(HttpStatusCode.InternalServerError, message, cause);
  }
}

export class NotFoundError extends RestError {
  public readonly name = "NotFoundError";

  constructor(message?: string, cause?: Error) {
    super(HttpStatusCode.NotFound, message, cause);
  }
}

interface ValidationErrorData {
  path?: string;
  message: string;
}

class BadRequestError extends RestError {
  public readonly name = "BadRequestError";
  public readonly jsonData: ValidationErrorData[];

  constructor(jsonData: ValidationErrorData[], message?: string, cause?: Error) {
    super(HttpStatusCode.BadRequest, message, cause);
    this.jsonData = jsonData;
  }
}

export const handleRestErrors = (e: Error, loggerBase: LoggerBase) => {
  if (isAxiosError(e)) {
    const logger = getLogger("handleRestErrors", loggerBase);

    logger.warn("rest call has errors: ", e, e.toJSON(), e.response, e.request, e.cause);
    logger.debug("rest call details, ", "config =", e.config, ", response json =", e.toJSON(), ", response =", e.response, "request =", e.request);

    if (e.response?.status === HttpStatusCode.BadRequest) {
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
    }
    if (e.response?.status === HttpStatusCode.Unauthorized || e.response?.status === HttpStatusCode.Forbidden) {
      const msg = "unauthorized user access";
      const err = new UnauthorizedError(msg);

      logger.debug("throwing error", err);
      throw err;
    }
    if (e.response?.status === HttpStatusCode.NotFound) {
      const msg = e.response.data;
      const err = new NotFoundError(msg);

      logger.debug("throwing error", err);
      throw err;
    }
    const err = new UnknownError("Unknown error: " + (e.response?.data || e.cause));

    logger.debug("throwing error", err);
    throw err;
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

export const handleRouteActionError = (e: unknown, overrideMessages?: Record<string, string>) => {
  if (e instanceof UnauthorizedError) {
    if (overrideMessages && HttpStatusCode.Unauthorized in overrideMessages) {
      const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: "", data: null };
      overrideResponseError(response, overrideMessages, e);
      return json(response, { status: e.httpStatusCode });
    }
    return redirect(getFullPath("loginPage"));
  }
  if (e instanceof BadRequestError) {
    const err = e as BadRequestError;
    const response: RouteHandlerErrorResponse<ValidationErrorData[]> = { type: "error", errorMessage: err.message, data: err.jsonData };
    overrideResponseError(response, overrideMessages, err);
    return json(response, { status: err.httpStatusCode });
  }
  if (e instanceof NotFoundError) {
    const err = e as NotFoundError;
    const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
    overrideResponseError(response, overrideMessages, err);
    return json(response, { status: err.httpStatusCode });
  }
  const err = e as RestError;
  const response: RouteHandlerErrorResponse<null> = { type: "error", errorMessage: err.message, data: null };
  overrideResponseError(response, overrideMessages, err);
  return json(response, { status: HttpStatusCode.InternalServerError });
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
