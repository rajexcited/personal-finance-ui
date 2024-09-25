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

export { default as CurrencyProfileService } from "./currency-profile-service";

export { ConfigTypeBelongsTo, ConfigTypeStatus, getLogger, handleRouteActionError, HttpStatusCode } from "../../../shared";

export type {
  UpdateConfigDetailsResource,
  UpdateConfigStatusResource,
  ConfigResource,
  DeleteConfigDetailsResource,
  RouteHandlerResponse,
} from "../../../shared";

export { ActionRelation } from "./security-action";
