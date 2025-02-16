import { ConfigTypeService, ConfigResource, ConfigTypeStatus, ConfigTypeBelongsTo, UpdateConfigStatusResource } from "../../../shared";

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

const configTypeService = ConfigTypeService(ConfigTypeBelongsTo.CurrencyProfile);

/**
 * retrives enabled currency profiles
 * @returns list of currency profile
 */
export const getCurrencyProfiles = async () => {
  const currencyProfiles = await configTypeService.getConfigTypeList([ConfigTypeStatus.Enable], 1);
  return currencyProfiles as CurrencyProfileResource[];
};

/**
 * deletes or archives a category
 * @param category
 */
export const deleteCurrencyProfile = async (currencyProfileId: string) => {
  await configTypeService.deleteConfigType(currencyProfileId);
};

export const updateCurrencyProfileStatus = async (currencyProfileStatusData: UpdateConfigStatusResource) => {
  await configTypeService.updateConfigTypeStatus(currencyProfileStatusData);
};
