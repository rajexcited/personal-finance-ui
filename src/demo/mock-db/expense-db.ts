import { ExpenseFields } from "../../pages/expenses/services";
import { ExpenseItemFields, ExpenseStatus, ReceiptProps } from "../../pages/expenses/services/field-types";
import { LoggerBase, difference, formatTimestamp, getLogger } from "../../services";
import { LocalDBStore, MyLocalDatabase } from "./db";
import { v4 as uuidv4 } from "uuid";
import datetime from "date-and-time";
import { auditData } from "../services/userDetails";
import { deleteReceiptFileData, updateExpenseIdForReceipt } from "./expense-receipts-db";
import { getExpenseCategories } from "./config-type-db";
import { getPymtAccounts } from "./pymt-acc-db";

const expenseDb = new MyLocalDatabase<ExpenseFields>(LocalDBStore.Expense);

// initialize on page load
const init = async () => {
  const expenseCategories = (await getExpenseCategories()).list;
  const categoryId = (categoryName: string) => {
    return expenseCategories.find((cat) => cat.name === categoryName)?.id;
  };

  const paymentAccounts = (await getPymtAccounts()).list;
  const pymtAccId = (accname: string) => {
    return paymentAccounts.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id;
  };

  const expenses = await expenseDb.getAll();

  if (expenses.length > 0) {
    return;
  }

  await expenseDb.addItem({
    id: uuidv4(),
    billName: "burger restaurant",
    amount: "21.20",
    description: "this is dummy expense for demo purpose",
    tags: "outdoor,dining,trip".split(","),
    paymentAccountId: pymtAccId("checking"),
    purchasedDate: formatTimestamp(datetime.addDays(new Date(), -10)),
    expenseCategoryId: categoryId("hangout"),
    receipts: [],
    expenseItems: [],
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
    expenseCategoryId: categoryId("food shopping"),
    verifiedTimestamp: formatTimestamp(datetime.addHours(new Date(), -1)),
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    expenseItems: [
      {
        id: uuidv4(),
        billName: "snacks",
        amount: "14.34",
        tags: "kids,breaktime,hangout".split(","),
        description: "for breakfast, break time during play or evening hangout",
        expenseCategoryId: categoryId("hangout"),
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
        expenseCategoryId: categoryId("home stuffs"),
        description: "",
      },
    ],
  });
};

await init();

export const getExpenses = async () => {
  const logger = getLogger("mock.db.expenses.getlist");

  const expenses = await expenseDb.getAll();

  logger.debug(
    "expense Ids =",
    expenses.map((xpns) => xpns.id),
    ", size=",
    expenses.length
  );
  return {
    list: expenses
      .filter((xp) => xp.status === ExpenseStatus.Enable)
      .map(
        (xp) =>
          ({
            ...xp,
            expenseItems: undefined,
          } as ExpenseFields)
      ),
  };
};

export const getExpenseDetails = async (expenseId: string) => {
  const existingExpense = await expenseDb.getItem(expenseId);
  if (existingExpense) {
    const details: ExpenseFields = {
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
      const rr: ReceiptProps = { ...r, expenseId: "", id: receiptIdResult.id as string, url: "", file: undefined };
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

export const addUpdateExpense = async (data: ExpenseFields) => {
  const logger = getLogger("mock.db.expenses.addUpdate");
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

    const existingExpenseItems = (existingExpense.expenseItems || []).reduce((obj: Record<string, ExpenseItemFields>, ei) => {
      obj[ei.id] = ei;
      return obj;
    }, {});
    const expenseItems = data.expenseItems || [];
    const updatedExistingExpenseIems = expenseItems
      .filter((ei) => existingExpenseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined }));
    const addedNewExpenseIems = expenseItems
      .filter((ei) => !existingExpenseItems[ei.id])
      .map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() }));

    const updatedExpense: ExpenseFields = {
      ...data,
      status: ExpenseStatus.Enable,
      receipts: receiptResult.list || [],
      expenseItems: [...updatedExistingExpenseIems, ...addedNewExpenseIems],
      auditDetails: auditData(existingExpense.auditDetails.createdBy, existingExpense.auditDetails.createdOn),
    };
    delete updatedExpense.expenseCategoryName;
    delete updatedExpense.paymentAccountName;
    await expenseDb.addUpdateItem(updatedExpense);
    return { updated: updatedExpense };
  }

  const newExpenseId = uuidv4();
  const receiptResult = await getReceiptsForExpenseAddUpdate([], data.receipts, data.id, newExpenseId, logger);
  if (receiptResult.error) {
    return { error: receiptResult.error };
  }
  const addedExpense: ExpenseFields = {
    ...data,
    id: newExpenseId,
    status: ExpenseStatus.Enable,
    receipts: data.receipts.map((r) => ({ ...r, id: uuidv4(), expenseId: "", url: "" })),
    expenseItems: data.expenseItems?.map((ei) => ({ ...ei, expenseCategoryName: undefined, id: uuidv4() })) || [],
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
      deletedTimestamp: formatTimestamp(new Date()),
      auditDetails: auditData(existingExpense.auditDetails.createdBy, existingExpense.auditDetails.createdOn),
    };
    await expenseDb.addUpdateItem(deletingExpense);
    return { deleted: { ...deletingExpense } as ExpenseFields };
  }
  return { error: "expense not found" };
};
