import { AxiosResponseHeaders } from "axios";
import { tokenSessionData } from "./userDetails";
import datetime from "date-and-time";
import { validate as uuidValidate, version as uuidVersion } from "uuid";

export interface ValidationErrorResource<R> {
  path: keyof R | "request";
  message: string;
}

export const missingValidation = <T>(data: T | null | undefined, keys: (keyof T)[]): ValidationErrorResource<T>[] => {
  if (!data) {
    return [{ path: "request", message: "missing request data" }];
  }

  const errors = keys.filter((key) => !data[key]).map((key) => ({ path: key, message: "missing value" }));
  return errors;
};

export const validateDataType = <T>(data: T, keys: (keyof T)[], datatype: "string" | "uuid" | "array"): ValidationErrorResource<T>[] => {
  const notmissingkeys = keys.filter((k) => data[k]);
  if (datatype === "uuid") {
    const errors = stringTypeValidation(data, notmissingkeys);
    if (errors.length === 0) {
      return notmissingkeys.filter((k) => !isValidUuid(data[k] as string)).map((k) => ({ path: k, message: "incorrect format" }));
    }
    return errors;
  }

  if (datatype === "string") {
    return stringTypeValidation(data, notmissingkeys);
  }

  if (datatype === "array") {
    return notmissingkeys.filter((k) => !Array.isArray(data[k])).map((k) => ({ path: k, message: "incorrect format" }));
  }

  throw new Error("data type not supported");
};

const stringTypeValidation = <T>(data: T, keys: (keyof T)[]): ValidationErrorResource<T>[] => {
  const errors = keys.filter((key) => typeof data[key] !== "string").map((key) => ({ path: key, message: "incorrect format" }));
  return errors;
};

export const isValidUuid = (id: string | null | undefined) => {
  return id && uuidValidate(id) && uuidVersion(id) === 4;
};

export const validateAuthorization = (headers?: any) => {
  const hdr = headers as AxiosResponseHeaders;
  const token = hdr?.get("Authorization");
  const tokendata = tokenSessionData();

  if (`Bearer ${tokendata.accessToken}` === token) {
    const remainingSeconds = datetime.subtract(new Date(tokendata.expiryTime), new Date()).toSeconds();
    return remainingSeconds > 1;
  }
  return false;
};
