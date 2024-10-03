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
export const getAccountTypes = async (status?: ConfigTypeStatus) => {
  const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const accountTypeListPromise = configTypeService.getConfigTypeList(paramStatuses);
  await Promise.all([accountTypeListPromise, initializePymtAccTypeTags()]);
  return await accountTypeListPromise;
};

export const addUpdateAccountType = async (accountType: ConfigResource) => {
  await configTypeService.addUpdateConfigType(accountType);
};

export const deleteAccountType = async (pymtAccountTypeId: string) => {
  await configTypeService.deleteConfigType(pymtAccountTypeId);
};

export const updateAccountTypeStatus = async (categoryStatusData: UpdateConfigStatusResource) => {
  await configTypeService.updateConfigTypeStatus(categoryStatusData);
};

const initializePymtAccTypeTags = pMemoize(async () => {
  const tagCount = await tagService.getCount();
  if (tagCount > 0) {
    return;
  }

  const response = await configTypeService.getConfigTags();
  await tagService.updateTags(response);
}, getCacheOption("2 sec"));

export const getPymtAccTypeTags = async () => {
  const tagList = await tagService.getTags();
  return tagList;
};
