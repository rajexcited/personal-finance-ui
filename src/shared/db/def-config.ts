export enum LocalDBStore {
  Expense = "expense-items-store",
  Config = "config-store",
  PaymentAccount = "pymt-account-store",
  ReceiptFile = "receipt-file-store",
  Tags = "tags-store",
  Statistics = "statistics-store",
}

export enum LocalDBStoreIndex {
  AuditUpdatedOn = "audit-updatedOn-index",
  ItemStatus = "item-status-index",
  BelongsTo = "belongsTo-index",
  ReceiptUrl = "receipt-url-index",
  CacheUpdatedOn = "cache-updatedOn-index",
}

interface IndexDetailType {
  name: LocalDBStoreIndex;
  keyPath: string | string[];
}

export interface StoreConfigType {
  name: LocalDBStore;
  keyPath: string | string[];
  expireHoure?: number;
  indexes: IndexDetailType[];
}

interface DBType {
  name: string;
  version: number;
  expireHour: number;
  stores: StoreConfigType[];
}

export const CacheIndex: IndexDetailType = {
  name: LocalDBStoreIndex.CacheUpdatedOn,
  keyPath: "updatedOn",
};

export const DataBaseConfig: DBType = {
  name: "expenseDb",
  version: 1,
  expireHour: 6,
  stores: [
    {
      name: LocalDBStore.Expense,
      keyPath: "id",
      indexes: [
        {
          name: LocalDBStoreIndex.AuditUpdatedOn,
          keyPath: "auditDetails.updatedOn",
        },
        {
          name: LocalDBStoreIndex.ItemStatus,
          keyPath: "status",
        },
      ],
    },
    {
      name: LocalDBStore.Config,
      expireHoure: 6,
      keyPath: "id",
      indexes: [
        {
          name: LocalDBStoreIndex.BelongsTo,
          keyPath: "belongsTo",
        },
        {
          name: LocalDBStoreIndex.ItemStatus,
          keyPath: ["belongsTo", "status"],
        },
        {
          name: LocalDBStoreIndex.AuditUpdatedOn,
          keyPath: ["belongsTo", "auditDetails.updatedOn"],
        },
      ],
    },
    {
      name: LocalDBStore.PaymentAccount,
      keyPath: "id",
      indexes: [
        {
          name: LocalDBStoreIndex.AuditUpdatedOn,
          keyPath: "auditDetails.updatedOn",
        },
        {
          name: LocalDBStoreIndex.ItemStatus,
          keyPath: "status",
        },
      ],
    },
    {
      name: LocalDBStore.ReceiptFile,
      keyPath: "id",
      indexes: [
        {
          name: LocalDBStoreIndex.ReceiptUrl,
          keyPath: "url",
        },
      ],
    },
    {
      name: LocalDBStore.Tags,
      keyPath: ["belongsTo", "value"],
      expireHoure: 24 * 30,
      indexes: [
        {
          name: LocalDBStoreIndex.BelongsTo,
          keyPath: "belongsTo",
        },
      ],
    },
    {
      name: LocalDBStore.Statistics,
      expireHoure: 10,
      keyPath: "id",
      indexes: [
        {
          name: LocalDBStoreIndex.BelongsTo,
          keyPath: ["belongsTo", "year"],
        },
      ],
    },
  ],
};
