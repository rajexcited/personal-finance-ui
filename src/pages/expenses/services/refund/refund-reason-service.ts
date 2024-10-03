import pMemoize from "p-memoize";
import {
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  UpdateConfigStatusResource,
  UpdateConfigDetailsResource,
  DeleteConfigDetailsResource,
  TagsService,
  TagBelongsTo,
  getCacheOption,
} from "../../../../shared";

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.RefundReason);
const tagService = TagsService(TagBelongsTo.RefundReasonConfig);

/**
 *
 * @returns
 */
const initializeTags = pMemoize(async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }
  const response = await configTypeService.getConfigTags();
  await tagService.updateTags(response);
}, getCacheOption("2 sec"));

/**
 * retrives undeleted categories
 */
export const getReasonList = async (status?: ConfigTypeStatus) => {
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const promise = configTypeService.getConfigTypeList(paramStatuses);
  await Promise.all([promise, initializeTags()]);
  const typeList = await promise;
  return typeList;
};

/**
 * retrives type item
 */
export const getReason = async (reasonId: string) => {
  const promise = configTypeService.getConfigType(reasonId);
  await Promise.all([promise, initializeTags()]);
  const reasonCfg = await promise;
  return reasonCfg;
};

/**
 * adds or updates the type
 */
export const addUpdateReason = async (reason: UpdateConfigDetailsResource) => {
  await configTypeService.addUpdateConfigType(reason);
};

/**
 * deletes or archives a type
 */
export const deleteReason = async (reason: DeleteConfigDetailsResource) => {
  await configTypeService.deleteConfigType(reason.id);
};

/**
 * updates status of type
 */
export const updateStatus = async (statusData: UpdateConfigStatusResource) => {
  await configTypeService.updateConfigTypeStatus(statusData);
};

/**
 * Retrieves all tags associated to refund types
 */
export const getTagList = async () => {
  const tagList = await tagService.getTags();
  return tagList;
};
