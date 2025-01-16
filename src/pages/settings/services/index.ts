import { ConfigResource } from "../../../shared";

export enum ActionId {
  Add = "add",
  View = "view",
  Update = "update",
  Delete = "delete",
  ToggleEnable = "toggleEnable",
  ToggleDisable = "toggleDisable",
}

export type TypeCategoryAction = {
  item: ConfigResource;
  type: ActionId;
};

export type { CurrencyProfileResource } from "./currency-profile-service";

export * as currencyProfileService from "./currency-profile-service";

export { ConfigTypeBelongsTo, ConfigTypeStatus, getLogger, handleRouteActionError, HttpStatusCode } from "../../../shared";

export type {
  UpdateConfigDetailsResource,
  UpdateConfigStatusResource,
  ConfigResource,
  DeleteConfigDetailsResource,
  RouteHandlerResponse,
} from "../../../shared";

export { ActionRelation } from "./security-action";

export * as sharePersonService from "./share-person/share-person-service";

export type {
  SharePersonResource,
  DeleteSharePersonResource,
  UpdateSharePersonResource,
  UpdateSharePersonStatusResource,
} from "./share-person/field-type";
