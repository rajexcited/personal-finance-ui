export interface AuditFields {
  createdBy?: string;
  updatedBy?: string;
  createdOn?: Date;
  updatedOn?: Date;
}

export const convertAuditFields = (fields: AuditFields) => {
  if (fields.createdOn) fields.createdOn = new Date(String(fields.createdOn));
  if (fields.updatedOn) fields.updatedOn = new Date(String(fields.updatedOn));
  return fields;
};
