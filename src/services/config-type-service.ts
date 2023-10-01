import { IDBPDatabase, openDB } from "idb";
import axios from "axios";
import { IDATABASE_TRACKER } from "./db";
import { AuditFields, convertAuditFields } from "./audit-fields";
import { REST_ROOT_PATH, handleRestErrors } from "./utils";

export interface ConfigType extends AuditFields {
  configId: string;
  value: string;
  name: string;
  relations: string[];
  belongsTo: string;
  description: string;
  status: ConfigTypeStatus;
  color?: string;
  icon?: string;
}

export enum ConfigTypeStatus {
  enable,
  disable,
  deleted,
}

interface ConfigTypeService {
  getConfigTypes(filterByStatuses?: ConfigTypeStatus[]): Promise<ConfigType[]>;
  addUpdateConfigType(details: ConfigType): Promise<void>;
  removeConfigType(details: ConfigType): Promise<void>;
  disableConfigType(details: ConfigType): Promise<void>;
  destroy(): void;
  db(): Promise<IDBPDatabase>;
}

const ConfigTypeServiceImpl = (belongsToParam: string): ConfigTypeService => {
  const objectStoreName = IDATABASE_TRACKER.EXPENSE_DATABASE.CONFIG_STORE.NAME;
  const dbPromise = openDB(IDATABASE_TRACKER.EXPENSE_DATABASE.NAME, IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION);

  const destroy = () => {
    dbPromise.then((db) => db.close());
  };

  /**
   * retieves list of configType. filter configType list by given parameter
   *
   * @param filterByStatus if not provided, retrieves all otherwise filter by status
   * @returns list of config type
   */
  const getConfigTypes = async (filterByStatuses?: ConfigTypeStatus[]) => {
    const db = await dbPromise;
    try {
      let dbKeys, queyParams, indexName: string;
      if (!filterByStatuses) {
        dbKeys = [belongsToParam];
        queyParams = { belongsTo: belongsToParam };
        indexName = IDATABASE_TRACKER.EXPENSE_DATABASE.CONFIG_STORE.INDEXES.BELONGS_TO_INDEX.NAME;
      } else {
        dbKeys = filterByStatuses.map((filterByStatus) => [belongsToParam, filterByStatus]);
        queyParams = { belongsTo: belongsToParam, status: filterByStatuses };
        console.log("queyParams: ", queyParams, "dbKeys: ", dbKeys);
        indexName = IDATABASE_TRACKER.EXPENSE_DATABASE.CONFIG_STORE.INDEXES.STATUS_INDEX.NAME;
      }

      const countPromises = dbKeys.map(async (dbKey) => db.countFromIndex(objectStoreName, indexName, dbKey));
      const totalCount = (await Promise.all(countPromises)).reduce((prev, curr) => curr + prev, 0);
      if (totalCount === 0) {
        // no records
        const response = await axios.get(REST_ROOT_PATH + "/config/types", { params: queyParams });
        const configTypes = response.data as ConfigType[];
        const dbAddPromises = configTypes.map(async (configType) => {
          convertAuditFields(configType);
          return db.add(objectStoreName, configType);
        });
        await Promise.all(dbAddPromises);
        return configTypes;
      }

      const configTypes = await db.getAllFromIndex(objectStoreName, indexName, dbKeys);
      return configTypes as ConfigType[];
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addUpdateConfigType = async (configType: ConfigType) => {
    const db = await dbPromise;
    try {
      if ((await db.count(objectStoreName, configType.configId)) === 0) {
        await updateConfigType(configType);
      } else {
        await addConfigType(configType);
      }
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addConfigType = async (configType: ConfigType) => {
    const data: any = { ...configType };
    delete data.configId;
    const response = await axios.post(REST_ROOT_PATH + "/config/types", data);
    const db = await dbPromise;
    await db.add(objectStoreName, response.data);
  };

  const updateConfigType = async (configType: ConfigType) => {
    const data = { ...configType };
    const response = await axios.post(REST_ROOT_PATH + "/config/types", data);
    const db = await dbPromise;
    await db.put(objectStoreName, response.data);
  };

  const removeConfigType = async (configType: ConfigType) => {
    const db = await dbPromise;
    try {
      const response = await axios.delete(REST_ROOT_PATH + "/config/types/" + configType.configId);
      await db.put(objectStoreName, response.data);
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const disableConfigType = async (configType: ConfigType) => {
    const cfgTyp = { ...configType, status: ConfigTypeStatus.disable };
    addUpdateConfigType(cfgTyp);
  };

  return {
    getConfigTypes,
    addUpdateConfigType,
    removeConfigType,
    disableConfigType,
    destroy,
    db: () => dbPromise,
  };
};

export default ConfigTypeServiceImpl;
