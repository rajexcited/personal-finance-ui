import { openDB } from "idb";

type indexKeyType = `${string}_index`;

interface IndexDetailType {
  NAME: string;
  KEYPATH: string | string[];
}

interface StoreConfigType {
  NAME: string;
  EXPIRE_HOURS?: number;
  KEYPATH: string | string[];
  INDEXES: {
    [key: Uppercase<indexKeyType>]: IndexDetailType;
  };
}

type StoreKeyType = `${string}_store`;

interface DBType {
  NAME: string;
  VERSION: number;
  EXPIRE_HOURS: number;
  [key: Uppercase<StoreKeyType>]: StoreConfigType;
}

const EXPENSE_DATABASE: DBType = {
  NAME: "expenseDb",
  VERSION: 1,
  EXPIRE_HOURS: 6,

  EXPENSE_ITEMS_STORE: {
    NAME: "expense-items-store",
    KEYPATH: "expenseId",
    INDEXES: {
      TAGS_INDEX: {
        NAME: "tagsIndex",
        KEYPATH: "tags",
      },
      CREATED_INDEX: {
        NAME: "createdOnIndex",
        KEYPATH: "createdOn",
      },
    },
  },
  CONFIG_STORE: {
    NAME: "config-store",
    EXPIRE_HOURS: 6,
    KEYPATH: "configId",
    INDEXES: {
      BELONGS_TO_INDEX: {
        NAME: "belongsToIndex",
        KEYPATH: "belongsTo",
      },
      STATUS_INDEX: {
        NAME: "statusIndex",
        KEYPATH: ["belongsTo", "status"],
      },
      CREATED_INDEX: {
        NAME: "createdOnIndex",
        KEYPATH: ["belongsTo", "createdOn"],
      },
    },
  },
  PYMT_ACCOUNT_STORE: {
    NAME: "pymt-account-store",
    KEYPATH: "accountId",
    INDEXES: {
      TAGS_INDEX: {
        NAME: "tagsIndex",
        KEYPATH: "tags",
      },
      CREATED_INDEX: {
        NAME: "createdOnIndex",
        KEYPATH: "createdOn",
      },
    },
  },
};

export const IDATABASE_TRACKER = { EXPENSE_DATABASE: EXPENSE_DATABASE };

export const getExpireHour = (storeName: string) => {
  const storeObj = Object.values(IDATABASE_TRACKER.EXPENSE_DATABASE).find(
    (v) => typeof v === "object" && v.NAME === storeName
  ) as StoreConfigType;

  if (storeObj && storeObj.EXPIRE_HOURS) {
    return storeObj.EXPIRE_HOURS;
  }
  return IDATABASE_TRACKER.EXPENSE_DATABASE.EXPIRE_HOURS;
};

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

// https://hackernoon.com/use-indexeddb-with-idb-a-1kb-library-that-makes-it-easy-8p1f3yqq
const db = await openDB(IDATABASE_TRACKER.EXPENSE_DATABASE.NAME, IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    console.log("in db upgrade", db, oldVersion, newVersion, transaction, event);
    Object.values(IDATABASE_TRACKER.EXPENSE_DATABASE).forEach((storeObj) => {
      if (typeof storeObj === "object") {
        const storeConfig = storeObj as StoreConfigType;
        const objectStoreName = storeConfig.NAME;
        if (!db.objectStoreNames.contains(objectStoreName)) {
          const store = db.createObjectStore(objectStoreName, { keyPath: storeConfig.KEYPATH, autoIncrement: true });
          Object.entries(storeConfig.INDEXES).forEach((entry) => {
            store.createIndex(entry[1].NAME, entry[1].KEYPATH);
          });
        } else {
          db.clear(objectStoreName);
        }
      }
    });
  },
});

Object.values(IDATABASE_TRACKER.EXPENSE_DATABASE).forEach((storeObj) => {
  if (typeof storeObj === "object" && "NAME" in storeObj) {
    const objectStoreName = storeObj.NAME;
    db.clear(objectStoreName);
  }
});
