import { HttpStatusCode, isAxiosError } from "axios";
import { LoggerBase, getLogger } from "./logger";

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

export class ConflictError extends RestError {
  public readonly name = "ConflictError";

  constructor(message?: string, cause?: Error) {
    super(HttpStatusCode.Conflict, message, cause);
  }
}

export interface ValidationErrorData {
  path?: string;
  message: string;
}

export class BadRequestError extends RestError {
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
    if (e.response?.status === HttpStatusCode.Conflict) {
      const msg = getExistingSessionInfo(e.response.data);
      const err = new ConflictError(msg);

      logger.debug("throwing error", err);
      throw err;
    }
    const err = new UnknownError("Unknown error: " + (e.response?.data || e.cause));

    logger.debug("throwing error", err);
    throw err;
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

const getExistingSessionInfo = (data: any) => {
  type ActiveSessionResource = Record<"address" | "platform" | "browser" | "browserVersion" | "deviceMode", string>;

  if (typeof data === "object" && "existingActiveSession" in data) {
    const sessionInfo = data.existingActiveSession as ActiveSessionResource;
    return `Another session is active at ${sessionInfo.address} in ${sessionInfo.browser}, ${sessionInfo.platform}`;
  }
  return "Unknown";
};
