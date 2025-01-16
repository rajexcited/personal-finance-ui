import { AxiosResponseHeaders } from "axios";
import { tokenSessionData } from "./userDetails";
import datetime from "date-and-time";
import { validate as uuidValidate, version as uuidVersion } from "uuid";

export interface ValidationErrorResource<R> {
  path: keyof R | "request";
  message: string;
}

const isDefined = (val: any) => {
  if (typeof val === "number") {
    return true;
  }
  return !!val;
};

export const missingValidation = <T extends Object>(data: T | null | undefined, keys: (keyof T)[]): ValidationErrorResource<T>[] => {
  if (!data) {
    return [{ path: "request", message: "missing request data" }];
  }
  const errors = keys.filter((key) => !isDefined(data[key])).map((key) => ({ path: key, message: "missing value" }));
  return errors;
};

export const validateDataType = <T>(data: T, keys: (keyof T)[], datatype: "string" | "number" | "uuid" | "array" | "arraynumber"): ValidationErrorResource<T>[] => {
  const notmissingkeys = keys.filter((k) => isDefined(data[k]));
  if (datatype === "uuid") {
    const errors = stringTypeValidation(data, notmissingkeys);
    if (errors.length === 0) {
      return notmissingkeys.filter((k) => !isValidUuid(data[k] as string)).map((k) => ({ path: k, message: "incorrect format" }));
    }
    return errors;
  }

  if (datatype === "number") {
    return notmissingkeys.filter((k) => !isValidNumber(data[k] as string)).map((k) => ({ path: k, message: "incorrect format" }));
  }

  if (datatype === "string") {
    return stringTypeValidation(data, notmissingkeys);
  }

  if (datatype === "array") {
    return notmissingkeys.filter((k) => !Array.isArray(data[k])).map((k) => ({ path: k, message: "incorrect format" }));
  }
  if (datatype === "arraynumber") {
    const notArrayErrors = notmissingkeys.filter((k) => !Array.isArray(data[k])).map((k) => ({ path: k, message: "incorrect format" }));
    if (notArrayErrors.length > 0) {
      return notArrayErrors;
    }
    return notmissingkeys
      .filter((k) => {
        const arr = data[k];
        if (Array.isArray(arr)) {
          if (arr.length === 0) {
            return true;
          }
          return !arr.find((v) => !isValidNumber(v));
        }
        return false;
      })
      .map((k) => ({ path: k, message: "incorrect format" }));
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
const isValidNumber = (no: string | number | null | undefined) => {
  const num = Number(no);
  return typeof no !== "number" ? no && isNaN(num) : isNaN(num);
};

export const validateAuthorization = (headers?: any) => {
  const hdr = headers as AxiosResponseHeaders;
  const token = hdr?.get("Authorization");
  const tokendata = tokenSessionData();

  if (tokendata.accessToken === token) {
    const remainingSeconds = datetime.subtract(new Date(tokendata.expiryTime), new Date()).toSeconds();
    return remainingSeconds > 1;
  }
  return false;
};
