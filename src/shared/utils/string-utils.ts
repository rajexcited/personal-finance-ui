import { validate as isValidUuid, version as getUuidVersion } from "uuid";

export const isNotBlank = (arg: string | null | undefined) => {
  return !isBlank(arg);
};

export const isBlank = (arg: string | null | undefined) => {
  if (arg && arg.replaceAll(/\s/g, "").length > 0) {
    return false;
  }
  return true;
};

export const isUuid = (id: string | null | undefined) => {
  if (id && isValidUuid(id) && getUuidVersion(id) === 4) {
    return true;
  }
  return false;
};
