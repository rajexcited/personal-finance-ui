import { ConfigResource, ConfigTypeService, ConfigTypeStatus, ConfigTypeBelongsTo, UpdateConfigStatusResource } from "../../../services";

const PymtAccountTypeServiceImpl = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.PaymentAccountType);

  /**
   * retrives undeleted account types
   * @returns list of account type
   */
  const getAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.Enable, ConfigTypeStatus.Disable]);
    return accountTypes;
  };

  /**
   * retrives enabled / active account types
   * @returns list of account type
   */
  const getActiveAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.Enable]);
    return accountTypes;
  };

  /**
   * retrives deleted / archive account types
   * @returns list of account type
   */
  const getDeletedAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.Deleted]);
    return accountTypes;
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

  return {
    getAccountTypes,
    getActiveAccountTypes,
    getDeletedAccountTypes,
    addUpdateAccountType,
    deleteAccountType,
    updateAccountTypeStatus,
  };
};

export default PymtAccountTypeServiceImpl;
