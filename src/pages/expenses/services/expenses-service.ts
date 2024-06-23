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
  LoggerBase,
} from "../../../services";
import { DownloadReceiptResource, ErrorReceiptProps, ExpenseFields, ExpenseItemFields, ExpenseStatus, ReceiptProps } from "./field-types";
import ExpenseCategoryService from "./expense-category-service";
import { PymtAccountService } from "../../pymt-accounts";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import datetime from "date-and-time";
import { ReceiptUploadError } from "./receipt-error";
import { validate as isValidUuid, version as getUuidVersion } from "uuid";

const pymtAccService = PymtAccountService();

const ExpenseServiceImpl = () => {
  const onBeforeExpiredReceiptFileCallback = async (item: DownloadReceiptResource) => {
    if (item.status === "success") {
      URL.revokeObjectURL(item.url);
    }
  };

  const expenseCategoryService = ExpenseCategoryService();
  const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);
  const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile, onBeforeExpiredReceiptFileCallback);
  const rootPath = "/expenses";
  const _logger = getLogger("service.expense");

  const getCategoryEnum = pMemoize(
    async () => {
      const logger = getLogger("getCategoryEnum", _logger);
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
    const logger = getLogger("getPaymentAccountMap", _logger);
    const startTime = new Date();

    const pymtAccs = await pymtAccService.getPymtAccounts();
    const pymtAccMap = new Map<string, string>();
    pymtAccs.forEach((acc) => {
      pymtAccMap.set(acc.id, acc.shortName);
    });
    logger.info("transformed to pymt acc Map, ", pymtAccMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
    return pymtAccMap;
  };

  const getPymtAccEnum = pMemoize(
    async () => {
      const logger = getLogger("getPymtAccEnum", _logger);
      logger.info("cache miss. calling service to get pymt accs");
      const pymtAccMap = await getPaymentAccountMap();
      const idkeys = [...pymtAccMap.keys()];
      idkeys.forEach((pak) => {
        const pav = pymtAccMap.get(pak);
        if (pav) {
          pymtAccMap.set(pav, pak);
        }
      });
      logger.info("transformed to pymt acc Map, ", pymtAccMap);
      return pymtAccMap;
    },
    { cache: new ExpiryMap(15 * 1000) }
  );

  const isUuid = (id: string | null | undefined) => {
    if (id && isValidUuid(id) && getUuidVersion(id) === 4) {
      return true;
    }
    return false;
  };

  const updateCategory = (categoryMap: Map<string, string>, item: ExpenseFields | ExpenseItemFields) => {
    if (item.expenseCategoryId && categoryMap.get(item.expenseCategoryId) && isUuid(item.expenseCategoryId)) {
      item.expenseCategoryName = categoryMap.get(item.expenseCategoryId);
    } else if (item.expenseCategoryName && categoryMap.get(item.expenseCategoryName) && !isUuid(item.expenseCategoryName)) {
      item.expenseCategoryId = categoryMap.get(item.expenseCategoryName);
    } else if (item.expenseCategoryId && !item.expenseCategoryName) {
      item.expenseCategoryName = item.expenseCategoryId;
    } else if (item.expenseCategoryName && !item.expenseCategoryId) {
      item.expenseCategoryId = item.expenseCategoryName;
    }
  };

  const updatePymtAcc = (pymtAccMap: Map<string, string>, item: ExpenseFields) => {
    if (item.paymentAccountId && pymtAccMap.get(item.paymentAccountId) && isUuid(item.paymentAccountId)) {
      item.paymentAccountName = pymtAccMap.get(item.paymentAccountId);
    } else if (item.paymentAccountName && pymtAccMap.get(item.paymentAccountName) && !isUuid(item.paymentAccountName)) {
      item.paymentAccountId = pymtAccMap.get(item.paymentAccountName);
    } else if (item.paymentAccountId && !item.paymentAccountName) {
      item.paymentAccountName = item.paymentAccountId;
    } else if (item.paymentAccountName && !item.paymentAccountId) {
      item.paymentAccountId = item.paymentAccountName;
    }
  };

  const updateCategoryAndPymtAccName = async (expenseItem: ExpenseFields) => {
    const logger = getLogger("updateCategoryAndPymtAccName", _logger);
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

  const updateExpenseReceipts = async (receipts: ReceiptProps[]) => {
    const logger = getLogger("updateExpenseReceipts", _logger);
    const receiptNames = new Set(receipts.map((rct) => rct.name));
    if (receiptNames.size !== receipts.length) {
      const receiptNameCounter: Record<string, number> = {};
      receipts.forEach((rct) => {
        const name = rct.name;
        if (receiptNames.has(name)) {
          const counter = receiptNameCounter[name] || 1;
          rct.name = name + "-" + counter;
          receiptNameCounter[name] = counter + 1;
        }
      });
    }

    const uploadedReceiptsPromises = receipts.map(async (rct) => {
      try {
        if (!rct.file) return { ...rct };

        logger.info("uploading receipt file, id =", rct.id, ", name =", rct.name, ", contenttype =", rct.contentType);
        const response = await axios.post(`${rootPath}/id/${rct.expenseId}/receipts/id/${rct.name}`, rct.file, {
          headers: { "Content-Type": rct.contentType },
        });
        const result: ReceiptProps = {
          name: rct.name,
          contentType: rct.contentType,
          id: rct.id,
          expenseId: rct.expenseId,
        };
        return result;
      } catch (e) {
        let err = e as Error;
        try {
          handleRestErrors(e as Error, logger);
          logger.warn("not rest error", e);
        } catch (ee) {
          err = ee as Error;
        }
        const erRct: ErrorReceiptProps = { ...rct, error: err };
        return erRct;
      }
    });
    const uploadedReceipts = await Promise.all(uploadedReceiptsPromises);
    logger.info("uploadedReceipts =", uploadedReceipts);
    const errorReceipts = uploadedReceipts.filter((rct) => "error" in rct);
    if (errorReceipts.length > 0) throw new ReceiptUploadError(errorReceipts as ErrorReceiptProps[]);
    return uploadedReceipts;
  };

  const getExpense = async (expenseId: string) => {
    const logger = getLogger("getExpense", _logger);

    try {
      const dbExpense = await expenseDb.getItem(expenseId);

      if (dbExpense && dbExpense.expenseItems) {
        return dbExpense;
      }

      const response = await axios.get(`${rootPath}/id/${expenseId}`);
      return addUpdateDbExpense(response.data, logger);
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
      const queryPageMonths = 3;
      const dbExpenses = await expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status || ExpenseStatus.Enable);
      logger.info("expenseDb.getAllFromIndex execution time =", subtractDates(null, startTime).toSeconds(), " sec.");

      const rangeStartDate = datetime.addMonths(new Date(), queryPageMonths * -1 * pageNo);
      const rangeEndDate = datetime.addMonths(new Date(), queryPageMonths * -1 * (pageNo - 1));
      const filteredExpenses = dbExpenses.filter((xpns) => {
        if (xpns.purchasedDate >= rangeStartDate && xpns.purchasedDate <= rangeEndDate) {
          return true;
        }
        if (xpns.auditDetails.updatedOn >= rangeStartDate && xpns.auditDetails.updatedOn <= rangeEndDate) {
          return true;
        }
        return false;
      });
      logger.info("db expenses =", [...filteredExpenses]);
      if (filteredExpenses.length > 0) {
        return filteredExpenses;
      }

      // call api to refresh the list
      let apiStartTime = new Date();
      const queryParams: Record<string, string[]> = {
        pageNo: [String(pageNo)],
        status: [status || ExpenseStatus.Enable],
        pageMonths: [String(queryPageMonths)],
      };
      const responsePromise = axios.get(rootPath, { params: queryParams });
      await Promise.all([responsePromise, getCategoryEnum(), getPymtAccEnum()]);
      logger.info("api execution time =", subtractDates(null, apiStartTime).toSeconds(), " sec");

      const response = await responsePromise;
      apiStartTime = new Date();
      const promises: Promise<ExpenseFields>[] = response.data.map(async (expense: ExpenseFields) => await addUpdateDbExpense(expense, logger));
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
      const data: ExpenseFields = {
        ...expense,
        purchasedDate: expense.purchasedDate instanceof Date ? formatTimestamp(expense.purchasedDate) : expense.purchasedDate,
        verifiedTimestamp: expense.verifiedTimestamp instanceof Date ? formatTimestamp(expense.verifiedTimestamp) : expense.verifiedTimestamp,
      };
      const response = await axios.post(rootPath, data);

      const expenseReceipts = expense.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
        obj[rct.name] = rct;
        return obj;
      }, {});

      const updateReceiptIdPromises = (response.data as ExpenseFields).receipts.map(async (rct) => {
        await cacheReceiptFile(expenseReceipts[rct.name], "AddUpdateGet", undefined, rct);
      });
      await Promise.all(updateReceiptIdPromises);

      // cleaning memory if receipt object is removed
      const existing = await expenseDb.getItem(response.data.id);
      if (existing) {
        const deleteReceiptPromises = existing.receipts.map(async (rct) => {
          if (!expenseReceipts[rct.name]) {
            await cacheReceiptFile(rct, "Remove");
          }
        });
        await Promise.all(deleteReceiptPromises);
      }

      await addUpdateDbExpense(response.data, logger);
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
      await addUpdateDbExpense(response.data, logger);
      const deletingReceiptPromises = (response.data as ExpenseFields).receipts.map(async (rct) => {
        await cacheReceiptFile(rct, "Remove");
      });
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const addUpdateDbExpense = async (expense: ExpenseFields, loggerBase: LoggerBase) => {
    // here we don't have url or file prop in receipts
    const logger = getLogger("addUpdateDbExpense", loggerBase);
    const transformStart = new Date();
    const dbExpense: ExpenseFields = {
      ...expense,
      purchasedDate: typeof expense.purchasedDate === "string" ? parseTimestamp(expense.purchasedDate) : expense.purchasedDate,
      verifiedTimestamp: typeof expense.verifiedTimestamp === "string" ? parseTimestamp(expense.verifiedTimestamp) : expense.verifiedTimestamp,
    };
    await updateCategoryAndPymtAccName(dbExpense);
    convertAuditFieldsToDateInstance(dbExpense.auditDetails);
    dbExpense.receipts = dbExpense.receipts.map((rct) => ({ ...rct, expenseId: expense.id }));

    logger.info("transforming execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    await expenseDb.addUpdateItem(dbExpense);
    logger.info("dbExpense =", dbExpense, ", execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    return dbExpense;
  };

  const getExpenseTags = async () => {
    const promises = [1, 2, 3, 4].map(async (pageNo) => await getExpenses(pageNo));
    const expenses = await Promise.all(promises);

    const tags = expenses.flatMap((xpns) => xpns).flatMap((xpns) => xpns.tags);
    const uniqueTags = new Set(tags);

    return [...uniqueTags];
  };

  const downloadReceipts = async (receipts: ReceiptProps[]) => {
    const logger = getLogger("downloadReceipts", _logger);
    logger.debug("starting to download and prepare resource list");

    const promises = receipts.map(async (rct) => {
      try {
        const cachedReceiptResponse = await cacheReceiptFile(rct, "AddUpdateGet");
        if (cachedReceiptResponse) {
          return cachedReceiptResponse as DownloadReceiptResource;
        }
        const fileResponse = await axios.get(`${rootPath}/id/${rct.expenseId}/receipts/id/${rct.id}`, { responseType: "blob" });
        const downloadReceiptResponse = await cacheReceiptFile(rct, "AddUpdateGet", fileResponse.data);
        if (!downloadReceiptResponse) {
          throw new Error("caching failed");
        }
        return downloadReceiptResponse as DownloadReceiptResource;
      } catch (e) {
        let err = e as Error;
        try {
          handleRestErrors(e as Error, logger);
        } catch (ee) {
          err = ee as Error;
        }
        const errorResponse: DownloadReceiptResource = {
          status: "fail",
          id: rct.id,
          error: err.name + " - " + err.message,
          expenseId: rct.expenseId,
        };
        return errorResponse;
      }
    });
    return await Promise.all(promises);
  };

  const cacheReceiptFile = async (receipt: ReceiptProps, action: "AddUpdateGet" | "Remove", fileData?: ArrayBuffer, newReceipt?: ReceiptProps) => {
    const resp = await receiptFileDb.getItem(receipt.id);

    if (action === "Remove") {
      if (resp?.status === "success" && resp.url) {
        URL.revokeObjectURL(resp.url);
        await receiptFileDb.delete(resp.id);
      }
    } else {
      // action is AddUpdateGet, must return some value

      if (resp?.status === "success" && receipt.url && resp.url !== receipt.url) {
        // precaution to avoid memory leak
        URL.revokeObjectURL(receipt.url);
      }

      if (resp?.status === "success") {
        if (newReceipt) {
          // action is update
          const updatingRes: DownloadReceiptResource = {
            ...resp,
            expenseId: newReceipt.expenseId,
            id: newReceipt.id,
          };
          await receiptFileDb.addUpdateItem(updatingRes);
          return { ...updatingRes };
        } else {
          // action is get
          return { ...resp };
        }
      }

      // action is add
      let receipturl: string | null = null;
      if (receipt.file) {
        receipturl = URL.createObjectURL(receipt.file);
      } else if (fileData) {
        const blobData = new Blob([fileData], { type: receipt.contentType });
        receipturl = URL.createObjectURL(blobData);
      }

      if (receipturl) {
        const result: DownloadReceiptResource = {
          id: newReceipt?.id || receipt.id,
          status: "success",
          expenseId: newReceipt?.expenseId || receipt.expenseId,
          url: receipturl,
        };
        await receiptFileDb.addItem(result);
        return { ...result };
      }
    }
  };

  return {
    getExpense,
    getExpenses,
    addUpdateExpense,
    removeExpense,
    getPaymentAccountMap,
    getExpenseTags,
    updateExpenseReceipts,
    downloadReceipts,
    cacheReceiptFile,
  };
};

(() => {
  const logger = getLogger("onPageLoad");
  const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile);
  logger.debug("deleting all receipt urls");
  receiptFileDb.clearAll();
})();

export default ExpenseServiceImpl;
