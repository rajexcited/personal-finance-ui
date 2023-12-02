import { IDBPDatabase, openDB } from "idb";
import { IDATABASE_TRACKER } from "./db";
import { AuditFields, convertAuditFields } from "./audit-fields";
import { handleRestErrors } from "./utils";
import axios from "./axios-proxy";

export interface ConfigType extends AuditFields {
  configId: string;
  value: string;
  name: string;
  relations: string[];
  belongsTo: ConfigTypeBelongsTo;
  description: string;
  status: ConfigTypeStatus;
  color?: string;
  icon?: string;
}

export enum ConfigTypeStatus {
  enable = "enable",
  disable = "disable",
  deleted = "deleted",
}

export enum ConfigTypeBelongsTo {
  ExpenseCategory = "expense-category",
  Auth = "auth",
  PaymentAccountType = "pymt-account-type",
}

interface ConfigTypeService {
  getConfigTypes(filterByStatuses?: ConfigTypeStatus[]): Promise<ConfigType[]>;
  addUpdateConfigType(details: ConfigType): Promise<void>;
  deleteConfigType(configId: string): Promise<void>;
  disableConfigType(details: ConfigType): Promise<void>;
  destroy(): void;
  db(): Promise<IDBPDatabase>;
}

const ConfigTypeServiceImpl = (belongsToParam: ConfigTypeBelongsTo): ConfigTypeService => {
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
        // console.debug("queyParams: ", queyParams, "dbKeys: ", dbKeys);
        indexName = IDATABASE_TRACKER.EXPENSE_DATABASE.CONFIG_STORE.INDEXES.STATUS_INDEX.NAME;
      }

      const countPromises = dbKeys.map(async (dbKey) => db.countFromIndex(objectStoreName, indexName, dbKey));
      const totalCount = (await Promise.all(countPromises)).reduce((prev, curr) => curr + prev, 0);
      if (totalCount === 0) {
        // no records
        const response = await axios.get("/config/types", { params: queyParams });
        const configTypes = response.data as ConfigType[];
        const dbAddPromises = configTypes.map(async (configType) => {
          convertAuditFields(configType);
          return db.add(objectStoreName, configType);
        });
        await Promise.all(dbAddPromises);
        return configTypes;
      }

      const configTypePromises = dbKeys.map(async (dbKey) => db.getAllFromIndex(objectStoreName, indexName, dbKey));
      const configTypes = (await Promise.all(configTypePromises)).flatMap((configType) => configType);

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
        await addConfigType(configType);
      } else {
        await updateConfigType(configType);
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
    const response = await axios.post("/config/types", data);
    const configResponse = {
      ...response.data,
    } as ConfigType;
    convertAuditFields(configResponse);
    const db = await dbPromise;
    await db.add(objectStoreName, configResponse);
  };

  const updateConfigType = async (configType: ConfigType) => {
    const data = { ...configType };
    const response = await axios.post("/config/types", data);
    const configResponse = {
      ...response.data,
    } as ConfigType;
    convertAuditFields(configResponse);
    const db = await dbPromise;
    await db.put(objectStoreName, configResponse);
  };

  const deleteConfigType = async (configId: string) => {
    const db = await dbPromise;
    try {
      const response = await axios.delete("/config/types/" + configId);
      await db.delete(objectStoreName, response.data.configId);
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
    deleteConfigType,
    disableConfigType,
    destroy,
    db: () => dbPromise,
  };
};

export default ConfigTypeServiceImpl;
