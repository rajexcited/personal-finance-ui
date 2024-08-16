import { v4 as uuidv4 } from "uuid";
import datetime from "date-and-time";
import { PurchaseFields, PurchaseItemFields, ExpenseStatus, ReceiptProps } from "../../pages/expenses";
import { LoggerBase, difference, formatTimestamp, parseTimestamp, getLogger } from "../../services";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { auditData } from "../services/userDetails";
import { deleteReceiptFileData, updateExpenseIdForReceipt } from "./expense-receipts-db";
import { getExpenseCategories } from "./config-type-db";
import { getPymtAccountList } from "./pymt-acc-db";

const expenseDb = new MyLocalDatabase<PurchaseFields>(LocalDBStore.Expense);
const _rootLogger = getLogger("mock.db.expenses", null, null, "DEBUG");

// initialize on page load
const init = async () => {
  const logger = getLogger("init", _rootLogger);

  const expenseCategories = (await getExpenseCategories()).list;
  logger.debug("retrieved", expenseCategories.length, "expense categories");

  const categoryId = (categoryName: string) => {
    return expenseCategories.find((cat) => cat.name === categoryName)?.id;
  };

  const paymentAccounts = (await getPymtAccountList()).list;
  logger.debug("retrieved", paymentAccounts.length, "payment accounts");
  const pymtAccId = (accname: string) => {
    return paymentAccounts.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id;
  };

  const expenses = await expenseDb.getAll();
  logger.debug("retrieved", expenses.length, "expenses");

  if (expenses.length > 0) {
    return;
  }

  logger.debug("creating sample expenses");
  await expenseDb.addItem({
    id: uuidv4(),
    billName: "burger restaurant",
    amount: "21.20",
    description: "this is dummy expense for demo purpose",
    tags: "outdoor,dining,trip".split(","),
    paymentAccountId: pymtAccId("checking"),
    purchasedDate: formatTimestamp(datetime.addDays(new Date(), -10)),
    purchaseTypeId: categoryId("hangout"),
    receipts: [],
    items: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
  });

  await expenseDb.addItem({
    id: uuidv4(),
    billName: "grocery store",
    amount: "63.80",
    description: "this is dummy expense for demo purpose",
    tags: "get2gethor,potluck".split(","),
    paymentAccountId: pymtAccId("cash"),
    purchasedDate: formatTimestamp(datetime.addDays(new Date(), -1)),
    purchaseTypeId: categoryId("food shopping"),
    verifiedTimestamp: formatTimestamp(datetime.addHours(new Date(), -1)),
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    items: [
      {
        id: uuidv4(),
        billName: "snacks",
        amount: "14.34",
        tags: "kids,breaktime,hangout".split(","),
        description: "for breakfast, break time during play or evening hangout",
        purchaseTypeId: categoryId("hangout"),
      },
      {
        id: uuidv4(),
        billName: "breakfast",
        amount: "8.7",
        tags: "breakfast,dairy".split(","),
        description: "milk, bread, butter, jaam",
      },
      {
        id: uuidv4(),
        billName: "non stick pan",
        amount: "39.7",
        tags: "utensil,kitchen".split(","),
        purchaseTypeId: categoryId("home stuffs"),
        description: "",
      },
    ],
  });
};

await init();

export interface ExpenseFilter {
  status?: ExpenseStatus[];
  pageNo?: number;
  pageMonths?: number;
}

const getDateInstance = (date: string | Date) => {
  if (date instanceof Date) {
    return date;
  }
  return parseTimestamp(date);
};

export const getExpenses = async (filters: ExpenseFilter) => {
  const logger = getLogger("getlist", _rootLogger);

  const filterStatuses = !filters.status || filters.status.length === 0 ? [ExpenseStatus.Enable] : filters.status;
  const expensePromises = filterStatuses.map((status) => {
    logger.debug("retrieving expenses for status [", status, "]");
    return expenseDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status);
  });
  const expenses = (await Promise.all(expensePromises)).flatMap((xp) => xp);
  logger.debug("retieved", expenses.length, "expenses. now filtering by given params");

  const pageMonths = filters.pageMonths || 3;
  const pageNo = filters.pageNo || 1;
  const rangeStartDate = datetime.addMonths(new Date(), pageMonths * -1 * pageNo);
  const rangeEndDate = datetime.addMonths(new Date(), pageMonths * -1 * (pageNo - 1));
  logger.debug(
    "filter params with given or default values",
    "pageMonths =",
    pageMonths,
    ", pageNo =",
    pageNo,
    ", rangeStartDate =",
    rangeStartDate,
    ", rangeEndDate =",
    rangeEndDate
  );
  const filteredExpenses = expenses.filter((xpns) => {
    logger.debug("expense id=", xpns.id, ", purchase date=", xpns.purchasedDate, ", updatedOn=", xpns.auditDetails.updatedOn);
    const purchasedDate = getDateInstance(xpns.purchasedDate);
    if (purchasedDate >= rangeStartDate && purchasedDate <= rangeEndDate) {
      return true;
    }
    const updatedOn = getDateInstance(xpns.auditDetails.updatedOn);
    if (updatedOn >= rangeStartDate && updatedOn <= rangeEndDate) {
      return true;
    }
    return false;
  });

  logger.debug(
    "expense Ids =",
    expenses.map((xpns) => xpns.id),
    ", size=",
    expenses.length,
    "filtered expense Ids =",
    filteredExpenses.map((xpns) => xpns.id),
    ", size=",
    filteredExpenses.length
  );

  return {
    list: filteredExpenses.map(
      (xp) =>
        ({
          ...xp,
          expenseItems: undefined,
        } as PurchaseFields)
    ),
  };
};

export const getExpenseDetails = async (expenseId: string) => {
  const existingExpense = await expenseDb.getItem(expenseId);
  if (existingExpense) {
    const details: PurchaseFields = {
      ...existingExpense,
    };
    return { getDetails: details };
  }
  return { error: "expense not found" };
};

const getReceiptsForExpenseAddUpdate = async (
  oldExpenseReceipts: ReceiptProps[],
  newExpenseReceipts: ReceiptProps[],
  oldExpenseId: string,
  newExpenseId: string,
  logger: LoggerBase
) => {
  const existingExpenseReceipts = oldExpenseReceipts.reduce((obj: Record<string, ReceiptProps>, r) => {
    obj[r.id] = r;
    return obj;
  }, {});
  const noChangeExistingReceipts = newExpenseReceipts.map((r) => existingExpenseReceipts[r.id]).filter((r) => r);

  const addedNewReceiptPromises = newExpenseReceipts
    .filter((r) => !existingExpenseReceipts[r.id])
    .map(async (r) => {
      const receiptIdResult = await updateExpenseIdForReceipt(newExpenseId, oldExpenseId, r.name);
      if (receiptIdResult.error) {
        return { ...r, error: receiptIdResult.error };
      }
      const rr: ReceiptProps = { ...r, purchaseId: "", id: receiptIdResult.id as string, url: "", file: undefined };
      return rr;
    });
  const addedNewReceipts = await Promise.all(addedNewReceiptPromises);
  const errorReceipt = addedNewReceipts.find((r) => "error" in r);
  if (errorReceipt) {
    return { error: "invalid receipt" };
  }

  const newExpenseReceiptIds = newExpenseReceipts.map((r) => r.id);
  const removingExistingReceipts = oldExpenseReceipts.filter((r) => !newExpenseReceiptIds.includes(r.id));
  const removingPromises = removingExistingReceipts.map(async (r) => {
    return await deleteReceiptFileData(oldExpenseId, r.id);
  });
  const removingResults = await Promise.all(removingPromises);
  logger.log(
    "removed receipts. ",
    removingResults.filter((r) => r.deleted).flatMap((r) => r)
  );
  logger.warn(
    "failed to removed receipts. errros: ",
    removingResults.filter((r) => r.error)
  );

  return { list: [...noChangeExistingReceipts, ...addedNewReceipts] };
};

export const addUpdateExpense = async (data: PurchaseFields) => {
  const logger = getLogger("addUpdate", _rootLogger);
  const existingExpense = await expenseDb.getItem(data.id);

  if (existingExpense) {
    logger.info("updating existing expense found. difference (data-existingExpense) =", difference(data, existingExpense));
    const receiptResult = await getReceiptsForExpenseAddUpdate(
      existingExpense.receipts,
      data.receipts,
      existingExpense.id,
      existingExpense.id,
      logger
    );
    if (receiptResult.error) {
      return { error: receiptResult.error };
    }

    const existingExpenseItems = (existingExpense.items || []).reduce((obj: Record<string, PurchaseItemFields>, ei) => {
      obj[ei.id] = ei;
      return obj;
    }, {});
    const expenseItems = data.items || [];
    const updatedExistingExpenseIems = expenseItems
      .filter((ei) => existingExpenseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined }));
    const addedNewExpenseIems = expenseItems
      .filter((ei) => !existingExpenseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() }));

    const updatedExpense: PurchaseFields = {
      ...data,
      status: ExpenseStatus.Enable,
      receipts: receiptResult.list || [],
      items: [...updatedExistingExpenseIems, ...addedNewExpenseIems],
      auditDetails: auditData(existingExpense.auditDetails.createdBy, existingExpense.auditDetails.createdOn),
    };
    delete updatedExpense.purchaseTypeName;
    delete updatedExpense.paymentAccountName;
    await expenseDb.addUpdateItem(updatedExpense);
    return { updated: updatedExpense };
  }

  const newExpenseId = uuidv4();
  const receiptResult = await getReceiptsForExpenseAddUpdate([], data.receipts, data.id, newExpenseId, logger);
  if (receiptResult.error) {
    return { error: receiptResult.error };
  }
  const addedExpense: PurchaseFields = {
    ...data,
    id: newExpenseId,
    status: ExpenseStatus.Enable,
    receipts: data.receipts.map((r) => ({ ...r, id: uuidv4(), expenseId: "", url: "" })),
    items: data.items?.map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() })) || [],
    auditDetails: auditData(),
  };

  await expenseDb.addUpdateItem(addedExpense);
  return { added: addedExpense };
};

export const deleteExpense = async (expenseId: string) => {
  const existingExpense = await expenseDb.getItem(expenseId);
  if (existingExpense) {
    const deletingExpense = {
      ...existingExpense,
      status: ExpenseStatus.Deleted,
      auditDetails: auditData(existingExpense.auditDetails.createdBy, existingExpense.auditDetails.createdOn),
    };
    await expenseDb.addUpdateItem(deletingExpense);
    return { deleted: { ...deletingExpense } as PurchaseFields };
  }
  return { error: "expense not found" };
};
