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

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.IncomeType);
const tagService = TagsService(TagBelongsTo.IncomeTypeConfig);

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
export const getList = async (status?: ConfigTypeStatus) => {
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const promise = configTypeService.getConfigTypeList(paramStatuses);
  await Promise.all([promise, initializeTags()]);
  const typeList = await promise;
  return typeList;
};

/**
 * retrives type item
 */
export const getDetails = async (incomeTypeId: string) => {
  const promise = configTypeService.getConfigType(incomeTypeId);
  await Promise.all([promise, initializeTags()]);
  const incomeTypeCfg = await promise;
  return incomeTypeCfg;
};

/**
 * adds or updates the type
 */
export const addUpdateDetails = async (incomeType: UpdateConfigDetailsResource) => {
  await configTypeService.addUpdateConfigType(incomeType);
};

/**
 * deletes or archives a type
 */
export const deleteIncomeType = async (incomeType: DeleteConfigDetailsResource) => {
  await configTypeService.deleteConfigType(incomeType.id);
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
