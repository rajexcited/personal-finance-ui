import { openDB } from "idb";
import axios from "axios";
import dateUtil from "date-and-time";
import { REST_ROOT_PATH, IDATABASE_TRACKER } from "../../constants";
import { ExpenseData } from "./expense-context";

const ExpenseService = async () => {
  const objectStoreName =
    IDATABASE_TRACKER.EXPENSE_DATABASE.EXPENSE_ITEMS_STORE.NAME;
  const updatedOnKey = "updatedOn";
  const expenseKeyPrefix = "xpns-";

  const getExpenses = async () => {
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
        // db.delete(objectStoreName);
        // refresh the data, rest call
        // const response = await axios.get(REST_ROOT_PATH + "/expenses");
        // const expenses = response.data as ExpenseData[];
        // db.add(objectStoreName, categories, categoriesKey);
        // db.put(objectStoreName, new Date(), updatedOnKey);
        // return categories;
      }
      const query = IDBKeyRange.bound(expenseKeyPrefix, "xpnt-", false, true);
      query.includes = (key: string) => key.startsWith(expenseKeyPrefix);
      const expenses = (await db.getAll(
        objectStoreName,
        query
      )) as ExpenseData[];

      return expenses;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      db.close();
    }
  };

  const addExpense = async (expense: ExpenseData) => {
    const db = await openDB(
      IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
      IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION
    );
    const key =
      expenseKeyPrefix +
      expense.expenseId +
      "-" +
      dateUtil.format(expense.purchasedDate, "DDMMYY");
    try {
      db.put(objectStoreName, new Date(), updatedOnKey);
      db.add(objectStoreName, expense, key);
      const data: any = { ...expense };
      //   delete data.expenseId;
      //   const response = await axios.post(REST_ROOT_PATH + "/expenses", data);
      //   expense.expenseId = response.data;
      //   db.put(objectStoreName, expense, key);
    } catch (e) {
      db.delete(objectStoreName, key);
      console.error(e);
      throw e;
    } finally {
      db.close();
    }
  };

  openDB(
    IDATABASE_TRACKER.EXPENSE_DATABASE.NAME,
    IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION,
    {
      upgrade(db, oldVersion, newVersion) {
        console.log(oldVersion, newVersion);
        if (!db.objectStoreNames.contains(objectStoreName)) {
          db.createObjectStore(objectStoreName);
        }
      },
    }
  );

  return {
    addExpense,
    getExpenses,
  };
};

export default ExpenseService;
