import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, UpdateConfigStatusResource } from "./field-type";
import { getCacheOption, getLogger, handleAndRethrowServiceError, NotFoundError } from "../../utils";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "../../db";
import axios from "../axios-proxy";
import { convertAuditFieldsToDateInstance } from "../audit-fields";
import pMemoize, { pMemoizeClear } from "p-memoize";
import * as apiUtils from "../api-response-cache";

export const ConfigTypeService = (belongsToParam: ConfigTypeBelongsTo) => {
  const configDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);

  const rootPath = `/config/types/belongs-to/${belongsToParam}`;
  const _logger = getLogger("service.config-type");

  /**
   * retieves list of configType. filter configType list by given parameter
   *
   * @param filterByStatus if not provided, retrieves all otherwise filter by status
   * @returns list of config type
   */
  const getConfigTypeList = pMemoize(async (filterByStatuses?: ConfigTypeStatus[]) => {
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
        // no records found
        const skipApiCall = await apiUtils.isApiCalled({ listSize: 0 }, rootPath, queyParams);
        if (skipApiCall) {
          return [];
        }
        // call api to get list
        const response = await axios.get(rootPath, { params: queyParams });
        apiUtils.updateApiResponse(response);
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
      handleAndRethrowServiceError(e as Error, logger);
      throw new Error("this never gets thrown");
    }
  }, getCacheOption("1 min"));

  /**
   * get details of config type by given params
   *
   * @param configId
   * @returns
   */
  const getConfigType = pMemoize(async (configId: string) => {
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
      handleAndRethrowServiceError(e as Error, logger);
      throw new Error("this never gets thrown");
    }
  }, getCacheOption("1 min"));

  /**
   * add or update config details
   *
   * @param configData
   */
  const addUpdateConfigType = pMemoize(async (configData: ConfigResource) => {
    const logger = getLogger("addUpdateConfigType", _logger);
    try {
      const data = { ...configData };
      const response = await axios.post(rootPath, data);
      const configResponse: ConfigResource = {
        ...response.data
      };
      convertAuditFieldsToDateInstance(configResponse.auditDetails);

      await configDb.addUpdateItem(configResponse);
      pMemoizeClear(getConfigTypeList);
      pMemoizeClear(getConfigType);
    } catch (e) {
      handleAndRethrowServiceError(e as Error, logger);
      throw new Error("this never gets thrown");
    }
  }, getCacheOption("5 sec"));

  /**
   * deletes config details by given id
   *
   * @param configId
   */
  const deleteConfigType = pMemoize(async (configId: string) => {
    const logger = getLogger("deleteConfigType", _logger);

    try {
      const response = await axios.delete(`${rootPath}/id/${configId}`);
      const configResponse = response.data as ConfigResource;
      await configDb.addUpdateItem(configResponse);
      pMemoizeClear(getConfigTypeList);
      pMemoizeClear(getConfigType);
    } catch (e) {
      handleAndRethrowServiceError(e as Error, logger);
      throw new Error("this never gets thrown");
    }
  }, getCacheOption("5 sec"));

  /**
   * updates the status of config
   * @param configstatusData
   */
  const updateConfigTypeStatus = pMemoize(async (configstatusData: UpdateConfigStatusResource) => {
    const logger = getLogger("updateConfigTypeStatus", _logger);

    try {
      const response = await axios.post(`${rootPath}/id/${configstatusData.id}/status/${configstatusData.status}`);
      const configResponse: ConfigResource = {
        ...response.data
      };
      convertAuditFieldsToDateInstance(configResponse.auditDetails);

      await configDb.addUpdateItem(configResponse);
      pMemoizeClear(getConfigTypeList);
      pMemoizeClear(getConfigType);
    } catch (e) {
      handleAndRethrowServiceError(e as Error, logger);
      throw new Error("this never gets thrown");
    }
  }, getCacheOption("5 sec"));

  /**
   * call api to get tags for config by type
   * @returns
   */
  const getConfigTags = async () => {
    const url = `${rootPath}/tags`;
    const skipApiCall = await apiUtils.isApiCalled({ listSize: 0 }, url);
    if (skipApiCall) {
      return [];
    }
    const response = await axios.get(url);
    apiUtils.updateApiResponse(response);
    return response.data as string[];
  };

  return {
    getConfigTypeList,
    getConfigType,
    addUpdateConfigType,
    deleteConfigType,
    updateConfigTypeStatus,
    getConfigTags
  };
};
