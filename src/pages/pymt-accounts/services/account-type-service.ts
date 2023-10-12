import { ConfigType, ConfigTypeService, ConfigTypeStatus } from "../../../services";

interface PymtAccountTypeService {
  getAccountTypes(): Promise<ConfigType[]>;
  getActiveAccountTypes(): Promise<ConfigType[]>;
  getDeletedAccountTypes(): Promise<ConfigType[]>;
  addUpdateAccountType(category: ConfigType): Promise<void>;
  removeAccountType(category: ConfigType): Promise<void>;
  destroy(): void;
}

const PymtAccountTypeServiceImpl = (): PymtAccountTypeService => {
  const configTypeService = ConfigTypeService("pymt-account-type");

  /**
   * retrives undeleted account types
   * @returns list of account type
   */
  const getAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.enable, ConfigTypeStatus.disable]);
    return accountTypes;
  };

  /**
   * retrives enabled / active account types
   * @returns list of account type
   */
  const getActiveAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.enable]);
    return accountTypes;
  };

  /**
   * retrives deleted / archive account types
   * @returns list of account type
   */
  const getDeletedAccountTypes = async () => {
    const accountTypes = await configTypeService.getConfigTypes([ConfigTypeStatus.deleted]);
    return accountTypes;
  };

  const addUpdateAccountType = async (accountType: ConfigType) => {
    await configTypeService.addUpdateConfigType(accountType);
  };

  const removeAccountType = async (accountType: ConfigType) => {
    await configTypeService.removeConfigType(accountType);
  };

  return {
    getAccountTypes,
    getActiveAccountTypes,
    getDeletedAccountTypes,
    addUpdateAccountType,
    removeAccountType,
    destroy: configTypeService.destroy.bind(null),
  };
};

export default PymtAccountTypeServiceImpl;
