import { parseTimestamp } from "../utils";

export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  createdOn: Date | string;
  updatedOn: Date | string;
}

export const convertAuditFieldsToDateInstance = (fields: AuditFields) => {
  if (typeof fields.createdOn === "string") fields.createdOn = parseTimestamp(fields.createdOn);
  if (typeof fields.updatedOn === "string") fields.updatedOn = parseTimestamp(fields.updatedOn);
  return fields;
};
