import { AxiosHeaders, AxiosRequestConfig } from "axios";
import { ValidationErrorResource } from "./common-validators";

export const AxiosResponseCreator = (config: AxiosRequestConfig) => {
  const responseHeaders = config.headers;

  const toSuccessResponse = (data: any, headers?: Record<string, string>) => {
    return toResponse(200, data, headers);
  };
  const toCreateResponse = (data: any, headers?: Record<string, string>) => {
    return toResponse(201, data, headers);
  };

  const toValidationError = <T>(errors: ValidationErrorResource<T>[]) => {
    return toError(400, errors);
  };

  const toForbiddenError = (error: any) => {
    return toError(401, error);
  };

  const toNotFoundError = (error: any) => {
    return toError(404, error);
  };

  const toUnknownError = (errors: any) => {
    return toError(500, errors);
  };

  const toError = (status: number, errors: any) => {
    return [status, errors, responseHeaders];
  };

  const toResponse = (status: number, data: any, respHdrs?: Record<string, string>) => {
    return [status, data, { ...responseHeaders, ...respHdrs }];
  };

  return {
    toValidationError,
    toUnknownError,
    toForbiddenError,
    toNotFoundError,
    toError,
    toResponse,
    toSuccessResponse,
    toCreateResponse
  };
};
