declare namespace Cypress {
  interface Chainable {
    /**
     *  deletes IndexedDb database
     * @param databaseName Optional.
     *          if provided, only specified indexedDb database will be deleted.
     *          if not provided, both databases will be deleted.
     */
    deleteIndexedDb(databaseName?: IndexedDbName): Chainable<void>;
    /**
     * Opens IndexedDb database for CRUD transactions
     * @param databaseName
     */
    indexedDb(databaseName: IndexedDbName): Chainable<IDBPDatabase>;
    /**
     * clears the object store in indexed db. deletes all records.
     *
     * @param options
     * @returns deleted records
     */
    clearStore<T>(options: { storeName: string }): Chainable<T[]>;
    /**
     * query object store by key to retrieve an item
     *
     * @param key
     * @param options object store name and index name if query should be
     */
    getItem<T>(key: string, options: { storeName: string; indexName?: string }): Chainable<T | null>;
    getItems<T>(options: { storeName: string; indexName?: string }, key?: string): Chainable<T[]>;
    updateItems<T>(items: T[], options: { storeName: string }): Chainable<T[]>;
    deleteItem(key: string, options: { storeName: string }): Chainable<void>;
    deleteItems<T>(key: string | string[], options: { storeName: string; indexName?: string }): Chainable<void>;
  }
}
