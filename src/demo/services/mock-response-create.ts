import { AxiosRequestConfig } from "axios";
import { ValidationErrorResource } from "./common-validators";

export const AxiosResponseCreator = (config: AxiosRequestConfig) => {
  const headers: any = config.headers;

  const toSuccessResponse = (data: any) => {
    return toResponse(200, data);
  };
  const toCreateResponse = (data: any) => {
    return toResponse(201, data);
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
    return [status, errors, headers];
  };

  const toResponse = (status: number, data: any) => {
    return [status, data, headers];
  };

  return {
    toValidationError,
    toUnknownError,
    toForbiddenError,
    toNotFoundError,
    toError,
    toResponse,
    toSuccessResponse,
    toCreateResponse,
  };
};
