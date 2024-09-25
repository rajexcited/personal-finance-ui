import { ActionRelation } from "../../services";

export enum ActionState {
  NoAction = "NA",
  UserRequest = "userRequest",
  UserSubmit = "userSubmit",
}

export type UserAction = { state: ActionState.NoAction } | { state: ActionState.UserRequest | ActionState.UserSubmit; type: ActionRelation };
