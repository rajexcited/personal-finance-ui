import { openDB } from "idb";
import axios from "axios";
import dateUtil from "date-and-time";
import { REST_ROOT_PATH, IDATABASE_TRACKER } from "../../constants";

export interface ConfigType {
  configId?: string;
  value: string;
  name: string;
  relations: string[];
  belongsTo: string;
  description?: string;
  status: "enable" | "disable";
}

const CategoryService = async () => {
  // store values to browser db
  // if db is old/expired, or doesn't have data, call service
  const objectStoreName =
    IDATABASE_TRACKER.EXPENSE_DATABASE.CATEGORY_STORE.NAME;
  const updatedOnKey = "updatedOn";
  const categoriesKey = "categories";

  const getCategories = async () => {
    const db = await openDB(
      IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
      IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION
    );
    try {
      let updatedOn = (await db.get(objectStoreName, updatedOnKey)) as Date;
      if (
        !updatedOn ||
        dateUtil.subtract(new Date(), updatedOn).toHours() >= 1
      ) {
        db.delete(objectStoreName, categoriesKey);
        // refresh the data, rest call
        const response = await axios.get(REST_ROOT_PATH + "/config/types", {
          params: { belongsTo: "category" },
        });
        const categories = response.data as ConfigType[];
        db.add(objectStoreName, categories, categoriesKey);
        db.put(objectStoreName, new Date(), updatedOnKey);
        return categories;
      }
      const categories = (await db.get(
        objectStoreName,
        categoriesKey
      )) as ConfigType[];

      return categories;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      db.close();
    }
  };

  const addCategory = async (category: ConfigType) => {
    const db = await openDB(
      IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
      IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION
    );
    try {
      db.put(objectStoreName, new Date(), updatedOnKey);
      db.add(objectStoreName, category, categoriesKey);
      const data = { ...category };
      delete data.configId;
      const response = await axios.post(REST_ROOT_PATH + "/config/types", data);
      category.configId = response.data;
      db.put(objectStoreName, category, categoriesKey);
    } catch (e) {
      db.delete(objectStoreName, categoriesKey);
      console.error(e);
      throw e;
    } finally {
      db.close();
    }
  };

  const updateCategory = () => async () => {
    const db = await openDB(
      IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
      IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION
    );
    try {
    } finally {
      db.close();
    }
  };

  const removeCategory = () => async () => {
    const db = await openDB(
      IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
      IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION
    );
    try {
    } finally {
      db.close();
    }
  };

  const db = await openDB(
    IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
    IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION,
    {
      upgrade(db, oldVersion, newVersion, transaction, event) {
        console.log(db, oldVersion, newVersion, transaction, event);
        if (!db.objectStoreNames.contains(objectStoreName)) {
          db.createObjectStore(objectStoreName);
        }
      },
    }
  );

  return {
    getCategories,
    addCategory,
    updateCategory,
  };
};

export default CategoryService;
