import { openDB } from "idb";
import { axios, IDATABASE_TRACKER, convertAuditFields, handleRestErrors } from "../../../services";
import { ExpenseFields, ExpenseItemFields, ReceiptProps } from "./field-types";
import ExpenseCategoryService from "./expense-category-service";
import { PymtAccountService } from "../../pymt-accounts";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import { difference } from "../../../services";

const pymtAccService = PymtAccountService();

interface ExpenseService {
  getExpenses(): Promise<ExpenseFields[]>;
  addUpdateExpense(details: ExpenseFields): Promise<void>;
  removeExpense(expenseId: string): Promise<void>;
  getExpense(expenseId: string): Promise<ExpenseFields | null>;
  getPaymentAccountMap(): Promise<Map<string, string>>;
  getExpenseTags(): Promise<string[]>;
  destroy(): void;
}

const ExpenseServiceImpl = (): ExpenseService => {
  const expenseCategoryService = ExpenseCategoryService();
  const objectStoreName = IDATABASE_TRACKER.EXPENSE_DATABASE.EXPENSE_ITEMS_STORE.NAME;
  const dbPromise = openDB(IDATABASE_TRACKER.EXPENSE_DATABASE.NAME, IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION);

  const getCategoryEnum = pMemoize(
    async () => {
      const categories = await expenseCategoryService.getCategories();
      const categoryMap = new Map<string, string>();
      categories.forEach((ctg) => {
        categoryMap.set(ctg.configId, ctg.name);
        categoryMap.set(ctg.name, ctg.configId);
      });
      return categoryMap;
    },
    { cache: new ExpiryMap(2 * 1000) }
  );

  const getPaymentAccountMap = async () => {
    const pymtAccs = await pymtAccService.getPymtAccounts();
    const pymtAccMap = new Map<string, string>();
    pymtAccs.forEach((acc) => {
      pymtAccMap.set(acc.shortName, acc.accountId);
    });
    return pymtAccMap;
  };

  const getPymtAccEnum = pMemoize(
    async () => {
      const pymtAccs = await pymtAccService.getPymtAccounts();
      const pymtAccMap = new Map<string, string>();
      pymtAccs.forEach((acc) => {
        pymtAccMap.set(acc.accountId, acc.shortName);
        pymtAccMap.set(acc.shortName, acc.accountId);
      });
      return pymtAccMap;
    },
    { cache: new ExpiryMap(1500) }
  );

  const updateCategory = (categoryMap: Map<string, string>, item: ExpenseFields | ExpenseItemFields) => {
    if (item.categoryId) item.categoryName = categoryMap.get(item.categoryId);
    else if (item.categoryName) item.categoryId = categoryMap.get(item.categoryName);
  };

  const updatePymtAcc = (pymtAccMap: Map<string, string>, item: ExpenseFields) => {
    if (item.pymtaccId) item.pymtaccName = pymtAccMap.get(item.pymtaccId);
    else if (item.pymtaccName) item.pymtaccId = pymtAccMap.get(item.pymtaccName);
  };

  const updateCategoryAndPymtAccName = async (expenseItem: ExpenseFields) => {
    const categoryMap = await getCategoryEnum();
    const pymtAccMap = await getPymtAccEnum();
    updateCategory(categoryMap, expenseItem);
    updatePymtAcc(pymtAccMap, expenseItem);
    if (expenseItem.expenseItems)
      expenseItem.expenseItems.forEach((itemBreakdown) => {
        updateCategory(categoryMap, itemBreakdown);
      });
  };

  const updateExpenseReceipts = async (expense: ExpenseFields) => {
    const uploadedReceiptsPromises = expense.receipts.map(async (rct) => {
      try {
        if (!rct.file) return { ...rct };
        const formData = new FormData();
        formData.append("file", rct.file);
        formData.append("type", rct.file.type);
        formData.append("name", rct.file.name);
        const response = await axios.postForm("/expenses/" + expense.expenseId + "/receipts", formData);
        const result: ReceiptProps = {
          ...rct,
          ...response.data,
          file: undefined,
        };
        return result;
      } catch (e) {
        try {
          handleRestErrors(e as Error);
        } catch (e) {
          return { ...rct, file: undefined, error: (e as Error).message };
        }
        throw { ...rct, file: undefined, error: (e as Error).message };
      }
    });
    expense.receipts = await Promise.all(uploadedReceiptsPromises);
    const errorReceipts = expense.receipts.filter((rct) => rct.error);
    if (errorReceipts.length > 0) throw new Error(JSON.stringify(errorReceipts));
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
      if (!expense) return null;
      await updateCategoryAndPymtAccName(expense);
      return expense;
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
        const response = await axios.get("/expenses");
        const expensesResponse = response.data as ExpenseFields[];
        const promises = expensesResponse.map(async (expenseItem) => {
          await updateCategoryAndPymtAccName(expenseItem);
        });
        await Promise.all(promises);
        const dbAddExpensePromises = expensesResponse.map((exp: any) => {
          const expense = {
            ...exp,
            purchasedDate: new Date(exp.purchasedDate),
          } as ExpenseFields;
          convertAuditFields(expense);
          return db.add(objectStoreName, expense);
        });
        await Promise.all(dbAddExpensePromises);
      }

      const expenses = (await db.getAll(objectStoreName)) as ExpenseFields[];
      if (!expenses) return [];
      // making sure that most recent names are mapped
      const promises = expenses.map(async (xpns) => {
        await updateCategoryAndPymtAccName(xpns);
        return xpns;
      });
      return await Promise.all(promises);
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addUpdateExpense = async (expense: ExpenseFields) => {
    const db = await dbPromise;

    try {
      // deleting properties to populated the correct value
      delete expense.categoryId;
      delete expense.pymtaccId;
      await updateCategoryAndPymtAccName(expense);
      await updateExpenseReceipts(expense);
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
      tags: exp.tags,
      expenseId: null,
    };
    const response = await axios.post("/expenses", data);
    const expensesResponse = response.data as ExpenseFields;
    await updateCategoryAndPymtAccName(expensesResponse);
    const expense = {
      ...expensesResponse,
      purchasedDate: new Date(expensesResponse.purchasedDate),
    } as ExpenseFields;
    convertAuditFields(expense);
    const db = await dbPromise;
    await db.add(objectStoreName, expense);
  };

  const updateExpense = async (exp: ExpenseFields) => {
    const data: any = {
      ...exp,
    };
    const dbExp: any = await getExpense(exp.expenseId);
    // console.debug("updateExpense", exp.expenseId, exp, JSON.stringify(difference(data, dbExp)));
    const response = await axios.post("/expenses", data);
    const expensesResponse = response.data as ExpenseFields;
    await updateCategoryAndPymtAccName(expensesResponse);
    const expense = {
      ...expensesResponse,
      purchasedDate: new Date(expensesResponse.purchasedDate),
    } as ExpenseFields;
    convertAuditFields(expense);
    const db = await dbPromise;
    await db.put(objectStoreName, expense);
  };

  const removeExpense = async (expenseId: string) => {
    const db = await dbPromise;
    try {
      const response = await axios.delete("/expenses/" + expenseId);
      await db.delete(objectStoreName, expenseId);
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const getExpenseTags = async () => {
    const expenses = await getExpenses();
    const tags = expenses
      .map((xpns) => xpns.tags)
      .join(",")
      .split(",");

    return tags;
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
    getPaymentAccountMap,
    getExpenseTags,
    destroy,
  };
};

export default ExpenseServiceImpl;
