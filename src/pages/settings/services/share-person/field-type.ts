import { AuditFields, ConfigAction, ConfigTypeStatus } from "../../../../shared";

export interface SharePersonResource {
  id: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  phone?: string;
  emailId: string;
  description: string;
  auditDetails: AuditFields;
  status: ConfigTypeStatus;
}

export type UpdateSharePersonStatusResource = Pick<SharePersonResource, "status" | "id"> & { action: ConfigAction.UpdateStatus };
export type UpdateSharePersonResource = SharePersonResource & { action: ConfigAction.AddUpdateDetails };
export type DeleteSharePersonResource = SharePersonResource & { action: ConfigAction.DeleteDetails };
