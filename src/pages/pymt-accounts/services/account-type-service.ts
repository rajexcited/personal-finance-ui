import {
  ConfigResource,
  ConfigTypeService,
  ConfigTypeStatus,
  ConfigTypeBelongsTo,
  UpdateConfigStatusResource,
  TagBelongsTo,
  TagsService,
} from "../../../services";

const PymtAccountTypeServiceImpl = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.PaymentAccountType);
  const tagService = TagsService();

  /**
   * retrives undeleted account types
   * @returns list of account type
   */
  const getAccountTypes = async (status?: ConfigTypeStatus) => {
    const paramStatuses = status ? [status] : [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
    const accountTypeListPromise = configTypeService.getConfigTypeList(paramStatuses);
    await Promise.all([accountTypeListPromise, initializePymtAccTypeTags()]);
    return await accountTypeListPromise;
  };

  const addUpdateAccountType = async (accountType: ConfigResource) => {
    await configTypeService.addUpdateConfigType(accountType);
  };

  const deleteAccountType = async (pymtAccountTypeId: string) => {
    await configTypeService.deleteConfigType(pymtAccountTypeId);
  };

  const updateAccountTypeStatus = async (categoryStatusData: UpdateConfigStatusResource) => {
    await configTypeService.updateConfigTypeStatus(categoryStatusData);
  };

  const initializePymtAccTypeTags = async () => {
    const tagCount = await tagService.getCount(TagBelongsTo.PaymentAccountTypeConfig);
    if (tagCount > 0) {
      return;
    }

    const response = await configTypeService.getConfigTags();
    await tagService.updateTags(TagBelongsTo.PaymentAccountTypeConfig, response);
  };

  const getPymtAccTypeTags = async () => {
    const tagList = await tagService.getTags(TagBelongsTo.PaymentAccountTypeConfig);
    return tagList;
  };

  return {
    getAccountTypes,
    addUpdateAccountType,
    deleteAccountType,
    updateAccountTypeStatus,
    getPymtAccTypeTags,
  };
};

export default PymtAccountTypeServiceImpl;
