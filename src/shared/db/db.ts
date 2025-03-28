import { IDBPDatabase, openDB } from "idb";
import { LoggerBase, getLogger } from "../utils";
import datetime from "date-and-time";
import { DataBaseConfig, CacheIndex, LocalDBStore, LocalDBStoreIndex, StoreConfigType } from "./def-config";

export const getUpperBound = (key: string, posFromEnd?: number) => {
  posFromEnd = posFromEnd || 1;
  posFromEnd = -1 * posFromEnd;
  let upperKey = key.slice(posFromEnd);
  upperKey = String.fromCharCode(upperKey.charCodeAt(0) + 1) + upperKey.slice(1);
  return key.slice(0, posFromEnd) + upperKey;
};

export const getLowerBound = (key: string, posFromEnd?: number) => {
  posFromEnd = posFromEnd || 1;
  posFromEnd = -1 * posFromEnd;
  let lowerKey = key.slice(posFromEnd);
  lowerKey = String.fromCharCode(lowerKey.charCodeAt(0) - 1) + lowerKey.slice(1);
  return key.slice(0, posFromEnd) + lowerKey;
};

const getItemKeyPath = (storeKeyPath: string | string[]) => {
  const prefixWithItem = (path: string) => "item." + path;
  if (Array.isArray(storeKeyPath)) {
    return storeKeyPath.map(prefixWithItem);
  }
  return prefixWithItem(storeKeyPath);
};

const configureLocalDatabase = async () => {
  const _logger = getLogger("configureLocalDatabase", null, null, "DISABLED");
  _logger.debug("opening DB");

  // https://hackernoon.com/use-indexeddb-with-idb-a-1kb-library-that-makes-it-easy-8p1f3yqq
  const db = await openDB(DataBaseConfig.name, DataBaseConfig.version, {
    upgrade(db, oldVersion, newVersion, transaction, event) {
      const logger = getLogger("upgrade", _logger);
      logger.info("db =", db, ", oldVersion =", oldVersion, ", newVersion =", newVersion, ", transaction =", transaction, ", event =", event);
      DataBaseConfig.stores.forEach((storeConfig) => {
        logger.debug("storeObj =", storeConfig);

        if (!db.objectStoreNames.contains(storeConfig.name)) {
          const store = db.createObjectStore(storeConfig.name, { keyPath: getItemKeyPath(storeConfig.keyPath) });
          logger.debug("created store =", store);

          store.createIndex(CacheIndex.name, CacheIndex.keyPath);
          storeConfig.indexes.forEach((indexConfig) => {
            logger.debug("created store index =", indexConfig);
            store.createIndex(indexConfig.name, getItemKeyPath(indexConfig.keyPath));
          });
        } else {
          logger.debug("existing store, so clearing all records.");
          db.clear(storeConfig.name);
        }
      });
    },
  });

  db.close();
};

await configureLocalDatabase();

interface DbItem<T> {
  item: T;
  updatedOn: number;
  createdOn: number;
}
type MyLocalDatabaseCallback<T> = (item: T) => Promise<void>;

enum MyLocalDatabaseCallbackName {
  OnBeforeExpired = "onBeforeExpiredCallback",
}

export class MyLocalDatabase<T> {
  private readonly _storeConfig: StoreConfigType;
  private readonly _logger: LoggerBase;
  private readonly callbacks: Partial<Record<MyLocalDatabaseCallbackName, MyLocalDatabaseCallback<T>>>;

  constructor(objectStoreName: LocalDBStore, onBeforeExpiredCallback?: MyLocalDatabaseCallback<T>) {
    const storeConfig = DataBaseConfig.stores.find((s) => s.name === objectStoreName);
    if (!storeConfig) {
      throw Error("object store is not supported for Db");
    }

    this._storeConfig = JSON.parse(JSON.stringify(storeConfig));
    if (this._storeConfig.expireHoure === undefined) {
      this._storeConfig.expireHoure = DataBaseConfig.expireHour;
    }

    this._logger = getLogger("MyLocalDatabase." + objectStoreName, null, null, "DISABLED");
    this.callbacks = {};
    if (onBeforeExpiredCallback) {
      this.callbacks[MyLocalDatabaseCallbackName.OnBeforeExpired] = onBeforeExpiredCallback;
    }
  }

  private validateKeyPath(logger: LoggerBase, key?: string | string[], index?: LocalDBStoreIndex) {
    let keyPath = undefined;
    if (index) {
      const foundIndex = this._storeConfig.indexes.find((si) => si.name === index);
      if (!foundIndex) {
        throw new Error("invalid index");
      }
      keyPath = foundIndex.keyPath;
      logger.debug("validating key, for index [", index, "] having keyPath [", keyPath, "] where given key [", key, "].");
    } else {
      keyPath = this._storeConfig.keyPath;
      logger.debug("validating key for having keyPath [", keyPath, "] where given key [", key, "].");
    }
    if (key) {
      let isGivenKeyValid = false;
      if (typeof keyPath === "string" && typeof key === "string") {
        isGivenKeyValid = true;
      } else if (Array.isArray(keyPath) && Array.isArray(key) && keyPath.length === key.length) {
        isGivenKeyValid = true;
      }
      if (!isGivenKeyValid) {
        throw new Error("given key is not correct pattern.");
      }
    }
  }

  private validateIndex(logger: LoggerBase, index?: LocalDBStoreIndex) {
    const foundIndex = this._storeConfig.indexes.find((si) => si.name === index);
    if (!foundIndex) {
      logger.debug("validateIndex, given index[", index, "] is not found in store [", this._storeConfig.name, "]");
      throw new Error("incorrect db index used");
    }
  }

  private async getCacheExpiryItems(db: IDBPDatabase, loggerBase: LoggerBase) {
    // delete all expired items
    const logger = getLogger("getCacheExpiryItems", loggerBase);

    const cacheExpiryHour = this._storeConfig.expireHoure || 0;
    const expiredTime = datetime.addHours(new Date(), cacheExpiryHour * -1).getTime();
    logger.debug("expiredTime =", expiredTime, " - ", new Date(expiredTime));
    const upperBoundQuery = IDBKeyRange.upperBound(expiredTime, true);

    const list = (await db.getAllFromIndex(this._storeConfig.name, CacheIndex.name, upperBoundQuery)) as DbItem<T>[];
    return list;
  }

  private async validateCacheExpiry(db: IDBPDatabase, loggerBase: LoggerBase) {
    // delete all expired items
    const logger = getLogger("validateCacheExpiry", loggerBase);

    const list = await this.getCacheExpiryItems(db, logger);
    logger.debug("deleting", list.length, "items");
    const deletePromises = list.map(async (o) => {
      const item = o.item as any;
      let storeKey: string | string[] | null = null;
      if (Array.isArray(this._storeConfig.keyPath)) {
        const invalidKey = this._storeConfig.keyPath.find((k) => !(k in item));
        if (!invalidKey) {
          storeKey = this._storeConfig.keyPath.map((k) => item[k]);
        }
      } else {
        if (this._storeConfig.keyPath in item) {
          storeKey = item[this._storeConfig.keyPath];
        }
      }

      if (storeKey) {
        if (this.callbacks.onBeforeExpiredCallback) {
          await this.callbacks.onBeforeExpiredCallback(item);
        }
        logger.debug("deleting item with key =", storeKey);
        await db.delete(this._storeConfig.name, storeKey);
      } else {
        logger.info("keypath [", this._storeConfig.keyPath, "] not found in item,", item);
      }
    });

    await Promise.all(deletePromises);
    logger.debug("items deleted");
  }

  public async countFromIndex(index: LocalDBStoreIndex, key?: string | string[]) {
    const logger = getLogger("countFromIndex", this._logger);
    this.validateIndex(logger, index);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened. clearing cache now");
    try {
      await this.validateCacheExpiry(db, logger);
      this.validateKeyPath(logger, key, index);
      const dbkey = key;
      logger.debug("dbkey =", dbkey, "getting count from index [", index, "]");
      const countPromise = db.countFromIndex(this._storeConfig.name, index, dbkey);
      const count = await countPromise;
      logger.debug("count response =", count);
      return count;
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  private async addToDb(item: T, db: IDBPDatabase) {
    const dbItem: DbItem<T> = {
      item: item,
      createdOn: new Date().getTime(),
      updatedOn: new Date().getTime(),
    };
    const addPromise = db.add(this._storeConfig.name, dbItem);
    return await addPromise;
  }

  private async updateToDb(dbRecord: DbItem<T>, item: T, db: IDBPDatabase) {
    const dbItem: DbItem<T> = {
      item: item,
      createdOn: dbRecord.createdOn,
      updatedOn: new Date().getTime(),
    };
    const updatePromise = db.put(this._storeConfig.name, dbItem);
    return await updatePromise;
  }

  public async addItem(item: T) {
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    try {
      return await this.addToDb(item, db);
    } finally {
      db.close();
    }
  }

  public async addUpdateItem(item: T) {
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    try {
      // const storeConfig = DataBaseConfig.stores.find((s) => s.name === this._storeConfig.name) as StoreConfigType;
      const itm = item as any;
      let storeKey: string | string[];
      if (Array.isArray(this._storeConfig.keyPath)) {
        const invalidKey = this._storeConfig.keyPath.find((k) => !(k in itm));
        if (invalidKey) {
          throw new Error("invalid db item object");
        }
        storeKey = this._storeConfig.keyPath.map((k) => itm[k]);
      } else {
        if (!(this._storeConfig.keyPath in itm)) {
          throw new Error("invalid db item object");
        }
        storeKey = itm[this._storeConfig.keyPath];
      }

      const dbRecord = (await db.get(this._storeConfig.name, storeKey)) as DbItem<T> | undefined;
      if (dbRecord) {
        return await this.updateToDb(dbRecord, item, db);
      }
      return await this.addToDb(item, db);
    } finally {
      db.close();
    }
  }

  public async getAllFromIndex(index: LocalDBStoreIndex, key?: string | string[]) {
    const logger = getLogger("getAllFromIndex", this._logger);
    this.validateIndex(logger, index);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened. now clearing expired");
    try {
      await this.validateCacheExpiry(db, logger);
      this.validateKeyPath(logger, key, index);
      const records = (await db.getAllFromIndex(this._storeConfig.name, index, key)) as DbItem<T>[] | undefined;
      logger.debug("retrieved array response");
      return (records || []).map((r) => r.item);
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  public async getAll() {
    const logger = getLogger("getAll", this._logger);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened. now clearing expired");
    try {
      await this.validateCacheExpiry(db, logger);

      logger.debug("getting all items");
      const records = (await db.getAll(this._storeConfig.name)) as DbItem<T>[] | undefined;
      logger.debug("retrieved array response");
      return (records || []).map((r) => r.item);
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  public async getItem(key: string) {
    const logger = getLogger("getItem", this._logger);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened. now clearing expired");
    try {
      await this.validateCacheExpiry(db, logger);
      this.validateKeyPath(logger, key);
      logger.debug("get item with key [", key, "]");
      const dbRecord = (await db.get(this._storeConfig.name, key)) as DbItem<T> | undefined;
      logger.debug("retrieved item response");
      if (dbRecord) {
        return dbRecord.item;
      }
      return null;
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  public async count() {
    const logger = getLogger("count", this._logger);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened");
    try {
      const size = await db.count(this._storeConfig.name);
      logger.debug("there are", size, "items in db");
      return size;
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  public async delete(key: string) {
    const logger = getLogger("delete", this._logger);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened");
    try {
      this.validateKeyPath(logger, key);
      await db.delete(this._storeConfig.name, key);
      logger.debug("item deleted with key [", key, "]");
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }

  public async clearAll() {
    const logger = getLogger("clearAll", this._logger);
    const db = await openDB(DataBaseConfig.name, DataBaseConfig.version);
    logger.debug("db is opened");
    try {
      await db.clear(this._storeConfig.name);
      logger.debug("all items deleted");
    } finally {
      logger.debug("closing db");
      db.close();
      logger.debug("db is closed");
    }
  }
}
