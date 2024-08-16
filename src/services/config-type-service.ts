import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { AuditFields, convertAuditFieldsToDateInstance } from "./audit-fields";
import { NotFoundError, handleRestErrors } from "./utils";
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

export type UpdateConfigStatusResource = Pick<ConfigResource, "status" | "id"> & { action: "updateStatus" };
export type UpdateConfigDetailsResource = ConfigResource & { action: "addUpdateDetails" };
export type DeleteConfigDetailsResource = ConfigResource & { action: "deleteDetails" };

export enum ConfigTypeStatus {
  Enable = "enable",
  Disable = "disable",
  Deleted = "deleted",
}

export enum ConfigTypeBelongsTo {
  PurchaseType = "purchase-type",
  PaymentAccountType = "pymt-account-type",
  CurrencyProfile = "currency-profile",
}

const ConfigTypeServiceImpl = (belongsToParam: ConfigTypeBelongsTo) => {
  const configDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);

  const rootPath = `/config/types/belongs-to/${belongsToParam}`;
  const _logger = getLogger("service.config-type");

  /**
   * retieves list of configType. filter configType list by given parameter
   *
   * @param filterByStatus if not provided, retrieves all otherwise filter by status
   * @returns list of config type
   */
  const getConfigTypeList = async (filterByStatuses?: ConfigTypeStatus[]) => {
    const logger = getLogger("getConfigTypes", _logger);
    try {
      let dbKeys: string[] | string[][];
      let queyParams: Record<string, string[]> | null = null;
      let dbIndex: LocalDBStoreIndex;

      if (!filterByStatuses) {
        dbKeys = [belongsToParam];
        dbIndex = LocalDBStoreIndex.BelongsTo;
      } else {
        dbKeys = filterByStatuses.map((filterByStatus) => [belongsToParam, filterByStatus]);
        queyParams = { status: filterByStatuses };
        dbIndex = LocalDBStoreIndex.ItemStatus;
      }

      const countPromises = dbKeys.map(async (dbKey) => configDb.countFromIndex(dbIndex, dbKey));
      const totalCount = (await Promise.all(countPromises)).reduce((prev, curr) => curr + prev, 0);
      if (totalCount === 0) {
        // no records
        const response = await axios.get(rootPath, { params: queyParams });
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

  const getConfigType = async (configId: string) => {
    const logger = getLogger("getConfigType", _logger);
    try {
      const configType = await configDb.getItem(configId);
      if (configType) {
        if (configType.belongsTo === belongsToParam) {
          return configType;
        }
        throw new NotFoundError("config type does not belong to " + belongsToParam);
      }

      // no records
      const response = await axios.get(`${rootPath}/id/${configId}`);
      const configTypeResponse = response.data as ConfigResource;
      convertAuditFieldsToDateInstance(configTypeResponse.auditDetails);
      await configDb.addUpdateItem(configTypeResponse);

      return configTypeResponse;
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
      const response = await axios.post(rootPath, data);
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
      const response = await axios.delete(`${rootPath}/id/${configId}`);
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
      const response = await axios.post(`${rootPath}/id/${configstatusData.id}/status/${configstatusData.status}`);
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

  const getConfigTags = async () => {
    const response = await axios.get(`${rootPath}/tags`);
    return response.data as string[];
  };

  return {
    getConfigType,
    getConfigTypeList,
    addUpdateConfigType,
    deleteConfigType,
    updateConfigTypeStatus,
    getConfigTags,
  };
};

export default ConfigTypeServiceImpl;
