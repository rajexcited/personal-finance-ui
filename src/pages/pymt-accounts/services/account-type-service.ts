import { ConfigType, ConfigTypeService, ConfigTypeStatus } from "../../../services";
import { ConfigTypeBelongsTo } from "../../../services/config-type-service";

interface PymtAccountTypeService {
  getAccountTypes(): Promise<ConfigType[]>;
  getActiveAccountTypes(): Promise<ConfigType[]>;
  getDeletedAccountTypes(): Promise<ConfigType[]>;
  addUpdateAccountType(pymtAccType: ConfigType): Promise<void>;
  deleteAccountType(pymtAccTypeId: string): Promise<void>;
  destroy(): void;
}

const PymtAccountTypeServiceImpl = (): PymtAccountTypeService => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.PaymentAccountType);

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

  const deleteAccountType = async (pymtAccountTypeId: string) => {
    await configTypeService.deleteConfigType(pymtAccountTypeId);
  };

  return {
    getAccountTypes,
    getActiveAccountTypes,
    getDeletedAccountTypes,
    addUpdateAccountType,
    deleteAccountType,
    destroy: configTypeService.destroy.bind(null),
  };
};

export default PymtAccountTypeServiceImpl;
