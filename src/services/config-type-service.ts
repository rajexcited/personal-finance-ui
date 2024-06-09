import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { AuditFields, convertAuditFieldsToDateInstance } from "./audit-fields";
import { handleRestErrors } from "./utils";
import axios from "./axios-proxy";
import { getLogger } from "./logger";

export interface ConfigResource {
  id: string;
  value: string;
  name: string;
  belongsTo: ConfigTypeBelongsTo;
  description: string;
  status: ConfigTypeStatus;
  color?: string;
  tags: string[];
  auditDetails: AuditFields;
}

export type UpdateConfigStatusResource = Pick<ConfigResource, "status" | "id">;

export enum ConfigTypeStatus {
  Enable = "enable",
  Disable = "disable",
  Deleted = "deleted",
}

export enum ConfigTypeBelongsTo {
  ExpenseCategory = "expense-category",
  PaymentAccountType = "pymt-account-type",
  CurrencyProfile = "currency-profile",
}

const ConfigTypeServiceImpl = (belongsToParam: ConfigTypeBelongsTo) => {
  const configDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);

  const rootPath = "/config/types/belongs-to";
  const _logger = getLogger("service.config-type");

  /**
   * retieves list of configType. filter configType list by given parameter
   *
   * @param filterByStatus if not provided, retrieves all otherwise filter by status
   * @returns list of config type
   */
  const getConfigTypes = async (filterByStatuses?: ConfigTypeStatus[]) => {
    const logger = getLogger("getConfigTypes", _logger);
    try {
      let dbKeys: string[] | string[][];
      let queyParams: Record<string, string[]> | null = null;
      let dbIndex: LocalDBStoreIndex;

      if (!filterByStatuses) {
        dbKeys = [belongsToParam];
        dbIndex = LocalDBStoreIndex.ConfigBelongsTo;
      } else {
        dbKeys = filterByStatuses.map((filterByStatus) => [belongsToParam, filterByStatus]);
        queyParams = { status: filterByStatuses };
        dbIndex = LocalDBStoreIndex.ItemStatus;
      }

      const countPromises = dbKeys.map(async (dbKey) => configDb.countFromIndex(dbIndex, dbKey));
      const totalCount = (await Promise.all(countPromises)).reduce((prev, curr) => curr + prev, 0);
      if (totalCount === 0) {
        // no records
        const response = await axios.get(`${rootPath}/${belongsToParam}`, { params: queyParams });
        const configTypes = response.data as ConfigResource[];
        const dbAddPromises = configTypes.map(async (configType) => {
          convertAuditFieldsToDateInstance(configType.auditDetails);
          return await configDb.addItem(configType);
        });
        await Promise.all(dbAddPromises);
        return configTypes;
      }

      const configTypePromises = dbKeys.map(async (dbKey) => configDb.getAllFromIndex(dbIndex, dbKey));
      const configTypesNested = await Promise.all(configTypePromises);
      const configTypes = configTypesNested.flatMap((configType) => configType);
      return configTypes;
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const addUpdateConfigType = async (configData: ConfigResource) => {
    const logger = getLogger("addUpdateConfigType", _logger);
    try {
      const data = { ...configData };
      const response = await axios.post(`${rootPath}/${belongsToParam}`, data);
      const configResponse: ConfigResource = {
        ...response.data,
      };
      convertAuditFieldsToDateInstance(configResponse.auditDetails);

      await configDb.addUpdateItem(configResponse);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const deleteConfigType = async (configId: string) => {
    const logger = getLogger("deleteConfigType", _logger);

    try {
      const response = await axios.delete(`${rootPath}/${belongsToParam}/id/${configId}`);
      const configResponse = response.data as ConfigResource;
      await configDb.addUpdateItem(configResponse);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const updateConfigTypeStatus = async (configstatusData: UpdateConfigStatusResource) => {
    const logger = getLogger("updateConfigTypeStatus", _logger);

    try {
      const response = await axios.post(`${rootPath}/${belongsToParam}/id/${configstatusData.id}/status/${configstatusData.status}`);
      const configResponse: ConfigResource = {
        ...response.data,
      };
      convertAuditFieldsToDateInstance(configResponse.auditDetails);

      await configDb.addUpdateItem(configResponse);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  return {
    getConfigTypes,
    addUpdateConfigType,
    deleteConfigType,
    updateConfigTypeStatus,
  };
};

export default ConfigTypeServiceImpl;
