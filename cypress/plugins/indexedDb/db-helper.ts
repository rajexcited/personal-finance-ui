import { IDBPDatabase, openDB, deleteDB } from "idb";

// Extend the Window interface to include __idb__
export interface IdbWindow {
  __idb__?: {
    openDB: typeof openDB;
    deleteDB: typeof deleteDB;
  };
}

// https://hackernoon.com/use-indexeddb-with-idb-a-1kb-library-that-makes-it-easy-8p1f3yqq

interface DbItem<T> {
  item: T;
  updatedOn: number;
  createdOn: number;
}

export const openDatabase = async (win: IdbWindow & Cypress.AUTWindow, databaseName: string) => {
  const idb = win.__idb__;
  if (idb) {
    return idb.openDB(databaseName);
  }
  throw new Error("idb is not initialized");
};

export const deleteDatabase = async (win: IdbWindow & Cypress.AUTWindow, databaseName: string) => {
  const idb = win.__idb__;
  if (idb) {
    return idb?.deleteDB(databaseName);
  }
  throw new Error("idb is not initialized");
};

export const getAllItemsFromStore = async <T>(db: IDBPDatabase, storeName: string, key?: string) => {
  const records: DbItem<T>[] = await db.getAll(storeName, key);
  if (!records) {
    return [];
  }
  return records.map((r) => r.item);
};

export const getItemFromStore = async <T>(db: IDBPDatabase, storeName: string, key: string) => {
  const dbRecord: DbItem<T> | undefined = await db.get(storeName, key);
  if (dbRecord) {
    return dbRecord.item;
  }
  return null;
};

export const getAllItemsFromIndex = async <T>(db: IDBPDatabase, storeName: string, indexName: string, key?: string) => {
  const records: DbItem<T>[] = await db.getAllFromIndex(storeName, indexName);
  if (!records) {
    return [];
  }
  return records.map((r) => r.item);
};

export const getItemFromIndex = async <T>(db: IDBPDatabase, storeName: string, indexName: string, key: string) => {
  const dbRecord: DbItem<T> | undefined = await db.getFromIndex(storeName, indexName, key);
  if (dbRecord) {
    return dbRecord.item;
  }
  return null;
};

export const addUpdateItem = async <T>(db: IDBPDatabase, storeName: string, item: T) => {
  const dbItem: DbItem<T> = {
    item: item,
    createdOn: new Date().getTime(),
    updatedOn: new Date().getTime()
  };
  const updateResult = await db.put(storeName, dbItem);
  console.log("item is updated. result=", updateResult);
  return updateResult;
};

export const addUpdateItems = async <T>(db: IDBPDatabase, storeName: string, items: T[]) => {
  for (let item of items) {
    await addUpdateItem(db, storeName, item);
  }
};

export const deleteItemFromStore = async (db: IDBPDatabase, storeName: string, key: string) => {
  await db.delete(storeName, key);
};

export const deleteItemsFromIndex = async (db: IDBPDatabase, storeName: string, indexName: string, key: string) => {
  const dbkeys = await db.getAllKeysFromIndex(storeName, indexName, key);
  const promises = dbkeys.map((k) => db.delete(storeName, k));
  await Promise.all(promises);
};
