import { openDB } from "idb";
import axios from "axios";
import { IDATABASE_TRACKER, REST_ROOT_PATH, convertAuditFields, handleRestErrors } from "../../../services";
import { ExpenseFields, ExpenseItemFields } from "../store/state/field-types";
import ExpenseCategoryService from "./expense-category-service";

interface ExpenseService {
  getExpenses(): Promise<ExpenseFields[]>;
  addUpdateExpense(details: ExpenseFields): Promise<void>;
  removeExpense(details: ExpenseFields): Promise<void>;
  getExpense(expenseId: string): Promise<ExpenseFields | null>;
  destroy(): void;
}

const ExpenseServiceImpl = (): ExpenseService => {
  const expenseCategoryService = ExpenseCategoryService();
  const objectStoreName = IDATABASE_TRACKER.EXPENSE_DATABASE.EXPENSE_ITEMS_STORE.NAME;
  const dbPromise = openDB(IDATABASE_TRACKER.EXPENSE_DATABASE.NAME, IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION);

  const getCategoryEnum = async () => {
    const categories = await expenseCategoryService.getCategories();
    const categoryMap = new Map<string, string>();
    categories.forEach((ctg) => {
      categoryMap.set(ctg.configId, ctg.name);
      categoryMap.set(ctg.name, ctg.configId);
    });
    return categoryMap;
  };

  const updateCategory = (categoryMap: Map<string, string>, item: ExpenseFields | ExpenseItemFields) => {
    if (item.categoryId) item.categoryName = categoryMap.get(item.categoryId);
    else if (item.categoryName) item.categoryId = categoryMap.get(item.categoryName);
  };

  const updateCategoriesInExpenseItems = async (expenseList: ExpenseFields[]) => {
    const categoryMap = await getCategoryEnum();
    const modifyCategory = updateCategory.bind(null, categoryMap);
    expenseList.forEach((expenseItem) => {
      modifyCategory(expenseItem);
      expenseItem.expenseItems.forEach((itemBreakdown) => {
        modifyCategory(itemBreakdown);
      });
    });
  };

  const getExpense = async (expenseId: string) => {
    const db = await dbPromise;
    try {
      if ((await db.count(objectStoreName, expenseId)) === 0) {
        const expenses = (await getExpenses()) as ExpenseFields[];
        const expense = expenses.find((val) => val.expenseId === expenseId);
        if (expense) return expense;
      }

      const expense = (await db.get(objectStoreName, expenseId)) as ExpenseFields;
      if (expense) return expense;
      return null;
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const getExpenses = async () => {
    const db = await dbPromise;
    try {
      if ((await db.count(objectStoreName)) === 0) {
        const response = await axios.get(REST_ROOT_PATH + "/expenses");
        const expensesResponse = response.data as ExpenseFields[];
        await updateCategoriesInExpenseItems(expensesResponse);
        const dbAddExpensePromises = expensesResponse.map((exp: any) => {
          const expense = {
            ...exp,
            purchasedDate: new Date(exp.purchasedDate),
            tags: [...exp.tags].join(","),
          } as ExpenseFields;
          convertAuditFields(expense);
          return db.add(objectStoreName, expense);
        });
        await Promise.all(dbAddExpensePromises);
      }

      const expenses = (await db.getAll(objectStoreName)) as ExpenseFields[];
      if (expenses) return expenses;

      return [];
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addUpdateExpense = async (expense: ExpenseFields) => {
    const db = await dbPromise;

    try {
      const categoryMap = await getCategoryEnum();
      updateCategory(categoryMap, expense);
      if ((await db.count(objectStoreName, expense.expenseId)) === 0) {
        await addExpense(expense);
      } else {
        await updateExpense(expense);
      }
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addExpense = async (exp: ExpenseFields) => {
    const data: any = {
      ...exp,
      tags: exp.tags.split(","),
      expenseId: null,
    };
    const response = await axios.post(REST_ROOT_PATH + "/expenses", data);
    const expensesResponse = response.data as ExpenseFields;
    await updateCategoriesInExpenseItems([expensesResponse]);
    const expense = {
      ...expensesResponse,
      purchasedDate: new Date(expensesResponse.purchasedDate),
      tags: [...expensesResponse.tags].join(","),
    } as ExpenseFields;
    convertAuditFields(expense);
    const db = await dbPromise;
    await db.add(objectStoreName, expense);
  };

  const updateExpense = async (exp: ExpenseFields) => {
    const data = {
      ...exp,
      tags: exp.tags.split(","),
    };
    const response = await axios.post(REST_ROOT_PATH + "/expenses", data);
    const expensesResponse = response.data as ExpenseFields;
    await updateCategoriesInExpenseItems([expensesResponse]);
    const expense = {
      ...expensesResponse,
      purchasedDate: new Date(expensesResponse.purchasedDate),
      tags: [...expensesResponse.tags].join(","),
    } as ExpenseFields;
    convertAuditFields(expense);
    const db = await dbPromise;
    await db.put(objectStoreName, expense);
  };

  const removeExpense = async (expense: ExpenseFields) => {
    const db = await dbPromise;
    try {
      const response = await axios.delete(REST_ROOT_PATH + "/expenses/" + expense.expenseId);
      await db.delete(objectStoreName, expense.expenseId);
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const destroy = () => {
    dbPromise.then((db) => db.close());
    expenseCategoryService.destroy();
  };

  return {
    getExpense,
    getExpenses,
    addUpdateExpense,
    removeExpense,
    destroy,
  };
};

export default ExpenseServiceImpl;
