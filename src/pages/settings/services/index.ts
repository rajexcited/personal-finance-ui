import { ConfigType } from "../../../services";

export enum ActionId {
  Add = "add",
  View = "view",
  Update = "update",
  Delete = "delete",
  ToggleEnable = "toggleEnable",
  ToggleDisable = "toggleDisable",
}

export type TypeCategoryAction = {
  item: ConfigType;
  type: ActionId;
};
export { ConfigTypeBelongsTo } from "../../../services";
