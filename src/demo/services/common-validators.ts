import { AxiosHeaders, AxiosResponseHeaders } from "axios";
import { tokenSessionData } from "./userDetails";
import datetime from "date-and-time";

export interface ValidationErrorResource {
  path: string;
  message: string;
}

export const missingValidation = (data: any, keys: string[]): ValidationErrorResource[] => {
  if (!data) {
    return [{ path: "request", message: "invalid data" }];
  }

  const errors = keys.filter((key) => !(data[key] || data[key].trim())).map((key) => ({ path: key, message: "missing " + key }));
  return errors;
};

export const validateUuid = (uuid: string, key: string): ValidationErrorResource | null => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!regex.test(uuid)) {
    return { path: key, message: "invalid id" };
  }
  return null;
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
