import { ConfigTypeService, ConfigResource, ConfigTypeStatus, ConfigTypeBelongsTo, UpdateConfigStatusResource } from "../../../services";

export interface CurrencyProfileResource extends ConfigResource {
  country: {
    name: string;
    code: string;
  };
  currency: {
    name: string;
    code: string;
    symbol: string;
  };
}

const CurrencyProfileServiceImpl = () => {
  const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.CurrencyProfile);

  /**
   * retrives enabled currency profiles
   * @returns list of currency profile
   */
  const getCurrencyProfiles = async () => {
    const currencyProfiles = await configTypeService.getConfigTypes([ConfigTypeStatus.Enable]);
    return currencyProfiles as CurrencyProfileResource[];
  };

  /**
   * deletes or archives a category
   * @param category
   */
  const deleteCurrencyProfile = async (currencyProfileId: string) => {
    await configTypeService.deleteConfigType(currencyProfileId);
  };

  const updateCurrencyProfileStatus = async (currencyProfileStatusData: UpdateConfigStatusResource) => {
    await configTypeService.updateConfigTypeStatus(currencyProfileStatusData);
  };

  return {
    getCurrencyProfiles,
    deleteCurrencyProfile,
    updateCurrencyProfileStatus,
  };
};

export default CurrencyProfileServiceImpl;
