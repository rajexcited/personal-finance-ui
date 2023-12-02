import { AxiosRequestConfig } from "axios";

export const AxiosResponseCreator = (config: AxiosRequestConfig) => {
  const headers: any = config.headers;

  const toSuccessResponse = (data: any) => {
    return toResponse(200, data);
  };
  const toCreateResponse = (data: any) => {
    return toResponse(201, data);
  };

  const toValidationError = (errors: { loc: string[]; msg: string }[]) => {
    return toError(400, { validation_error: { body_params: errors } });
  };

  const toForbiddenError = (error: any) => {
    return toError(401, error);
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
    toError,
    toResponse,
    toSuccessResponse,
    toCreateResponse,
  };
};
