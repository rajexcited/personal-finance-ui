import axios from "axios";
import datetime from "date-and-time";
import { json, redirect } from "react-router-dom";
import {} from "../pages";
import { LoggerBase, getLogger } from "./logger";
import { getFullPath } from "../pages/root";

export { HttpStatusCode } from "axios";

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
      } else if (Array.isArray(e.response.data)) {
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

export const isBlank = (arg: string) => {
  if (arg && arg.replaceAll(/\s/g, "").length > 0) {
    return false;
  }
  return true;
};

const DEFAULT_FORMAT_PATTERN = "MM-DD-YYYY HH:mm:ss.SSS Z";
export const parseTimestamp = (timestampStr: string, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.parse(timestampStr, format);
};

export const formatTimestamp = (timestamp: Date, formatPattern?: string | null) => {
  const format = formatPattern || DEFAULT_FORMAT_PATTERN;

  return datetime.format(timestamp, format);
};

type DateParamType = string | null | undefined | number | Date;
/**
 *  Subtracting date2 from date1. date1 - date2
 *
 * @param date1 if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param date2 if string, will convert to date instance to subtract. if null or undefined, will use current time to subtract
 * @param format if not provided, will apply default
 * @returns subtracted instance
 */
export const subtractDates = (date1: DateParamType, date2?: DateParamType, format?: string) => {
  const getDate = (date: DateParamType) => {
    let dd = new Date();
    if (date instanceof Date) {
      dd = date;
    } else if (typeof date === "string") {
      dd = parseTimestamp(date, format);
    } else if (typeof date === "number") {
      dd = new Date(date);
    }

    return dd;
  };

  return datetime.subtract(getDate(date1), getDate(date2));
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
