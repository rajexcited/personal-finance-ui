import pMemoize from "p-memoize";
import {
  ConfigResource,
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  UpdateConfigStatusResource,
  TagBelongsTo,
  TagsService,
  getCacheOption,
} from "../../../shared";

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.PaymentAccountType);
const tagService = TagsService(TagBelongsTo.PaymentAccountTypeConfig);

/**
 * retrives undeleted account types
 * @returns list of account type
 */
export const getAccountTypes = pMemoize(async (status?: ConfigTypeStatus) => {
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const accountTypeListPromise = configTypeService.getConfigTypeList(paramStatuses);
  await Promise.all([accountTypeListPromise, initializePymtAccTypeTags()]);
  return await accountTypeListPromise;
}, getCacheOption("30 sec"));

export const addUpdateAccountType = pMemoize(async (accountType: ConfigResource) => {
  await configTypeService.addUpdateConfigType(accountType);
}, getCacheOption("2 sec"));

export const deleteAccountType = pMemoize(async (pymtAccountTypeId: string) => {
  await configTypeService.deleteConfigType(pymtAccountTypeId);
}, getCacheOption("2 sec"));

export const updateAccountTypeStatus = pMemoize(async (categoryStatusData: UpdateConfigStatusResource) => {
  await configTypeService.updateConfigTypeStatus(categoryStatusData);
}, getCacheOption("2 sec"));

const initializePymtAccTypeTags = async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }

  const response = await configTypeService.getConfigTags();
  await tagService.updateTags(response);
};

export const getPymtAccTypeTags = async () => {
  const tagList = await tagService.getTags();
  return tagList;
};
