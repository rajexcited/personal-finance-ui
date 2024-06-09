import {
  axios,
  convertAuditFieldsToDateInstance,
  handleRestErrors,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LocalDBStoreIndex,
  parseTimestamp,
  formatTimestamp,
  subtractDates,
} from "../../../services";
import { ExpenseFields, ExpenseItemFields, ExpenseStatus, ReceiptProps } from "./field-types";
import ExpenseCategoryService from "./expense-category-service";
import { PymtAccountService } from "../../pymt-accounts";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";

const pymtAccService = PymtAccountService();

const ExpenseServiceImpl = () => {
  const expenseCategoryService = ExpenseCategoryService();
  const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
  const rootPath = "/expenses";
  const _logger = getLogger("service.expense");

  const getCategoryEnum = pMemoize(
    async () => {
      const logger = getLogger("getCategoryEnum");
      const startTime = new Date();
      logger.info("cache miss. calling service to get expense categories");
      const categories = await expenseCategoryService.getCategories();
      const categoryMap = new Map<string, string>();
      categories.forEach((ctg) => {
        categoryMap.set(ctg.id, ctg.name);
        categoryMap.set(ctg.name, ctg.id);
      });
      logger.info("transformed to category Map, ", categoryMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
      return categoryMap;
    },
    { cache: new ExpiryMap(10 * 1000) }
  );

  const getPaymentAccountMap = async () => {
    return await getPymtAccEnum();
  };

  const getPymtAccEnum = pMemoize(
    async () => {
      const logger = getLogger("getPymtAccEnum");
      const startTime = new Date();
      logger.info("cache miss. calling service to get pymt accs");
      const pymtAccs = await pymtAccService.getPymtAccounts();
      const pymtAccMap = new Map<string, string>();
      pymtAccs.forEach((acc) => {
        pymtAccMap.set(acc.id, acc.shortName);
        pymtAccMap.set(acc.shortName, acc.id);
      });
      logger.info("transformed to pymt acc Map, ", pymtAccMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
      return pymtAccMap;
    },
    { cache: new ExpiryMap(10 * 1000) }
  );

  const updateCategory = (categoryMap: Map<string, string>, item: ExpenseFields | ExpenseItemFields) => {
    if (item.expenseCategoryId) item.expenseCategoryName = categoryMap.get(item.expenseCategoryId);
    else if (item.expenseCategoryName) item.expenseCategoryId = categoryMap.get(item.expenseCategoryName);
  };

  const updatePymtAcc = (pymtAccMap: Map<string, string>, item: ExpenseFields) => {
    if (item.paymentAccountId) item.paymentAccountName = pymtAccMap.get(item.paymentAccountId);
    else if (item.paymentAccountName) item.paymentAccountId = pymtAccMap.get(item.paymentAccountName);
  };

  const updateCategoryAndPymtAccName = async (expenseItem: ExpenseFields) => {
    const logger = getLogger("updateCategoryAndPymtAccName");
    let startTime = new Date();
    const categoryMap = await getCategoryEnum();
    const pymtAccMap = await getPymtAccEnum();
    updateCategory(categoryMap, expenseItem);
    updatePymtAcc(pymtAccMap, expenseItem);
    if (expenseItem.expenseItems) {
      expenseItem.expenseItems.forEach((itemBreakdown) => {
        updateCategory(categoryMap, itemBreakdown);
      });
    }
    logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
  };

  const updateExpenseReceipts = async (receipts: ReceiptProps[], expenseId: string) => {
    const logger = getLogger("updateExpenseReceipts", _logger);
    const uploadedReceiptsPromises = receipts.map(async (rct) => {
      try {
        if (!rct.file) return { ...rct };
        // const formData = new FormData();
        // formData.append("file", rct.file);
        // formData.append("type", rct.file.type);
        // formData.append("name", rct.file.name);
        const response = await axios.post(`${rootPath}/id/${expenseId}/receipts/id/${rct.name}`, rct.file, {
          headers: { "Content-Type": rct.contentType },
        });
        const result: ReceiptProps = {
          name: rct.name,
          contentType: rct.contentType,
          id: rct.id,
        };
        return result;
      } catch (e) {
        let errorMessage: string = "";
        try {
          const err = e as Error;
          handleRestErrors(err, logger);
          logger.warn("not rest error", e);
          errorMessage = "unknown error";
        } catch (ee) {
          errorMessage = (ee as Error).message;
        }
        return { ...rct, error: errorMessage };
      }
    });
    const uploadedReceipts = await Promise.all(uploadedReceiptsPromises);
    const errorReceipts = receipts.filter((rct) => rct.error);
    if (errorReceipts.length > 0) throw new Error(JSON.stringify(errorReceipts));
    return uploadedReceipts;
  };

  const getExpense = async (expenseId: string) => {
    const logger = getLogger("getExpense", _logger);

    try {
      const dbExpense = await expenseDb.getItem(expenseId);

      if (dbExpense && dbExpense.expenseItems) {
        await updateCategoryAndPymtAccName(dbExpense);
        return dbExpense;
      }

      const response = await axios.get(`${rootPath}/id/${expenseId}`);
      const expensesResponse = response.data as ExpenseFields;
      expensesResponse.receipts.forEach((rct) => (rct.url = `${rootPath}/id/${expensesResponse.id}/receipts/id/${rct.id}`));
      await updateCategoryAndPymtAccName(expensesResponse);
      await expenseDb.addItem(expensesResponse);

      return expensesResponse;
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const getExpenses = async (pageNo: number, status?: ExpenseStatus) => {
    const logger = getLogger("getExpenses", _logger);

    const startTime = new Date();
    try {
      const dbExpenses = await expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status || ExpenseStatus.Enable);
      logger.info("expenseDb.getAllFromIndex execution time =", subtractDates(null, startTime).toSeconds(), " sec.");
      if (dbExpenses.length > 0) {
        //todo filter all records by pageNo filter criteria
        logger.info("db expenses =", [...dbExpenses]);
        return [...dbExpenses];
      }

      // call api to refresh the list
      let apiStartTime = new Date();
      const queryParams: Record<string, string[]> = { pageNo: [String(pageNo)], status: [status || ExpenseStatus.Enable] };
      const responsePromise = axios.get(rootPath, { params: queryParams });
      getCategoryEnum();
      getPymtAccEnum();

      const expensesResponse = (await responsePromise).data as ExpenseFields[];
      logger.info("from api, expensesResponse =", expensesResponse);
      logger.info("api execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");
      apiStartTime = new Date();
      const promises = expensesResponse.map(async (expenseItem) => {
        const transformStart = new Date();
        const expense: ExpenseFields = {
          ...expenseItem,
          purchasedDate: parseTimestamp(expenseItem.purchasedDate as string),
          verifiedTimestamp: expenseItem.verifiedTimestamp ? parseTimestamp(expenseItem.verifiedTimestamp as string) : undefined,
        };
        await updateCategoryAndPymtAccName(expense);
        convertAuditFieldsToDateInstance(expense.auditDetails);
        expense.receipts.forEach((rct) => (rct.url = `${rootPath}/id/${expense.id}/receipts/id/${rct.id}`));

        logger.info("transforming execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
        await expenseDb.addItem(expense);
        logger.info("expense added to DB, ", expense, " execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
        return expense;
      });
      logger.info("transformed expense resources, execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");
      return await Promise.all(promises);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    } finally {
      logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
    }
  };

  const addUpdateExpense = async (expense: ExpenseFields) => {
    const logger = getLogger("addUpdateExpense", _logger);

    try {
      await updateCategoryAndPymtAccName(expense);
      // await updateExpenseReceipts(expense);
      const data: ExpenseFields = {
        ...expense,
        purchasedDate: expense.purchasedDate instanceof Date ? formatTimestamp(expense.purchasedDate) : expense.purchasedDate,
        verifiedTimestamp: expense.verifiedTimestamp instanceof Date ? formatTimestamp(expense.verifiedTimestamp) : expense.verifiedTimestamp,
        receipts: [...expense.receipts],
      };
      const response = await axios.post(rootPath, data);
      const expenseResponse: ExpenseFields = { ...response.data };
      convertAuditFieldsToDateInstance(expenseResponse.auditDetails);
      expenseResponse.receipts.forEach((rct) => (rct.url = `${rootPath}/id/${expense.id}/receipts/id/${rct.id}`));
      await expenseDb.addUpdateItem(expenseResponse);
      // if ((await db.count(objectStoreName, expense.id)) === 0) {
      //         await addExpense(expense);
      //       } else {
      //         await updateExpense(expense);
      //       }
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const removeExpense = async (expenseId: string) => {
    const logger = getLogger("removeExpense", _logger);

    try {
      const response = await axios.delete(`${rootPath}/id/${expenseId}`);
      const expenseResponse: ExpenseFields = { ...response.data };
      await expenseDb.addUpdateItem(expenseResponse);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const getExpenseTags = async () => {
    const expenses = await getExpenses(1);
    const tags = expenses.flatMap((xpns) => xpns.tags);

    return tags;
  };

  return {
    getExpense,
    getExpenses,
    addUpdateExpense,
    removeExpense,
    getPaymentAccountMap,
    getExpenseTags,
    updateExpenseReceipts,
  };
};

export default ExpenseServiceImpl;
