import { v4 as uuidv4 } from "uuid";
import { ExpenseStatus } from "../../pages/expenses";
import { LoggerBase, ObjectDeepDifference, formatTimestamp, getDateInstanceDefaultNewDate, getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { auditData } from "../services/userDetails";
import { deleteReceiptFileData, updateIncomeIdForReceipt } from "./receipts-db";
import { getPymtAccountList } from "./pymt-acc-db";
import { ExpenseBelongsTo, IncomeFields } from "../../pages/expenses/services";
import { ReceiptProps } from "../../components/receipt";
import { JSONObject } from "../../shared/utils/deep-obj-difference";
import { getDefaultCurrencyProfileId, getIncomeTypes } from "./config-type-db";

const incomeDb = new MyLocalDatabase<IncomeFields>(LocalDBStore.Expense);
const rootLogger = getLogger("mock.db.expense.income", null, null, "DISABLED");

// initialize on page load
export const initializeIncomeDb = async () => {
  const logger = getLogger("init", rootLogger);

  const incomeTypes = (await getIncomeTypes()).list;
  logger.debug("retrieved", incomeTypes.length, "income types");

  const typeId = (typeName: string) => {
    const matchedType = incomeTypes.find((inctyp) => inctyp.value === typeName);
    if (!matchedType) {
      throw new Error("type not matched");
    }
    return matchedType.id;
  };

  const paymentAccounts = (await getPymtAccountList()).list;
  logger.debug("retrieved", paymentAccounts.length, "payment accounts");
  const pymtAccId = (accname: string) => {
    return paymentAccounts.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id as string;
  };

  const incomes = await incomeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.Income);
  logger.debug("retrieved", incomes.length, "incomes");

  if (incomes.length > 0) {
    return;
  }

  const currencyProfileId = await getDefaultCurrencyProfileId();

  logger.debug("creating sample expenses");
  await incomeDb.addItem({
    id: uuidv4(),
    billName: "salary",
    amount: "1500.00",
    description: "job salary",
    tags: "job".split(","),
    paymentAccountId: pymtAccId("checking"),
    paymentAccountName: "",
    incomeDate: formatTimestamp(new Date()),
    incomeTypeId: typeId("salary"),
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    belongsTo: ExpenseBelongsTo.Income,
    incomeTypeName: "salary",
    personIds: [],
    currencyProfileId: currencyProfileId
  });
};

await initializeIncomeDb();

export const getIncomeTags = async (incomeYears: number[]) => {
  const logger = getLogger("getIncomeTags", rootLogger);

  const incomeList = await incomeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.Income);
  logger.debug("retrieved", incomeList.length, "incomes. now filtering by year");

  logger.debug("incomeYears =", incomeYears, ", incomeYearRanges =", incomeYears);
  const taglist = incomeList
    .filter((ii) => {
      const incomeYear = getDateInstanceDefaultNewDate(ii.incomeDate).getFullYear();
      return incomeYears.includes(incomeYear);
    })
    .flatMap((ii) => ii.tags);

  return { list: taglist };
};

export const getIncomeDetails = async (incomeId: string) => {
  const existingIncome = await incomeDb.getItem(incomeId);
  if (existingIncome && existingIncome.belongsTo === ExpenseBelongsTo.Income) {
    const details: IncomeFields = {
      ...existingIncome
    };
    return { getDetails: details };
  }
  return { error: "income not found" };
};

const getReceiptsForIncomeAddUpdate = async (
  oldIncomeReceipts: ReceiptProps[],
  newIncomeReceipts: ReceiptProps[],
  oldIncomeId: string,
  newIncomeId: string,
  logger: LoggerBase
) => {
  const existingIncomeReceipts = oldIncomeReceipts.reduce((obj: Record<string, ReceiptProps>, r) => {
    obj[r.id] = r;
    return obj;
  }, {});
  const noChangeExistingReceipts = newIncomeReceipts.map((r) => existingIncomeReceipts[r.id]).filter((r) => r);

  const addedNewReceiptPromises = newIncomeReceipts
    .filter((r) => !existingIncomeReceipts[r.id])
    .map(async (r) => {
      const receiptIdResult = await updateIncomeIdForReceipt(newIncomeId, oldIncomeId, r.id);
      if (receiptIdResult.error) {
        return { ...r, error: receiptIdResult.error };
      }
      const rr: ReceiptProps = { ...r, relationId: "", id: receiptIdResult.id as string, url: "", file: undefined };
      return rr;
    });
  const addedNewReceipts = await Promise.all(addedNewReceiptPromises);
  const errorReceipt = addedNewReceipts.find((r) => "error" in r);
  if (errorReceipt) {
    return { error: "invalid receipt" };
  }

  const newIncomeReceiptIds = newIncomeReceipts.map((r) => r.id);
  const removingExistingReceipts = oldIncomeReceipts.filter((r) => !newIncomeReceiptIds.includes(r.id));
  const removingPromises = removingExistingReceipts.map(async (r) => {
    return await deleteReceiptFileData(oldIncomeId, r.id);
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

export const addUpdateIncome = async (data: IncomeFields) => {
  const logger = getLogger("addUpdateIncome", rootLogger);
  const existingIncome = await incomeDb.getItem(data.id);

  if (existingIncome) {
    logger.info(
      "updating existing income found. difference (data-existingIncome) =",
      ObjectDeepDifference(data as unknown as JSONObject, existingIncome as unknown as JSONObject)
    );
    const receiptResult = await getReceiptsForIncomeAddUpdate(existingIncome.receipts, data.receipts, existingIncome.id, existingIncome.id, logger);
    if (receiptResult.error) {
      return { error: receiptResult.error };
    }

    const updatedIncome: IncomeFields = {
      ...data,
      status: ExpenseStatus.Enable,
      receipts: receiptResult.list || [],
      auditDetails: auditData(existingIncome.auditDetails.createdBy, existingIncome.auditDetails.createdOn),
      currencyProfileId: await getDefaultCurrencyProfileId(),
      tags: data.tags.map((tg) => tg.replace(" ", "-"))
    };

    // delete updatedIncome.paymentAccountName;
    await incomeDb.addUpdateItem(updatedIncome);
    return { updated: updatedIncome };
  }

  const newIncomeId = uuidv4();
  const receiptResult = await getReceiptsForIncomeAddUpdate([], data.receipts, data.id, newIncomeId, logger);
  if (receiptResult.error) {
    return { error: receiptResult.error };
  }
  const addedIncome: IncomeFields = {
    ...data,
    id: newIncomeId,
    status: ExpenseStatus.Enable,
    receipts: data.receipts.map((r) => ({ ...r, id: uuidv4(), relationId: "", url: "" })),
    auditDetails: auditData(),
    currencyProfileId: await getDefaultCurrencyProfileId(),
    tags: data.tags.map((tg) => tg.replace(" ", "-"))
  };

  await incomeDb.addUpdateItem(addedIncome);
  return { added: addedIncome };
};

export const deleteIncome = async (incomeId: string) => {
  const existingIncome = await incomeDb.getItem(incomeId);
  if (existingIncome && existingIncome.belongsTo === ExpenseBelongsTo.Income) {
    const deletingIncome = {
      ...existingIncome,
      status: ExpenseStatus.Deleted,
      auditDetails: auditData(existingIncome.auditDetails.createdBy, existingIncome.auditDetails.createdOn)
    };
    await incomeDb.addUpdateItem(deletingIncome);
    return { deleted: { ...deletingIncome } as IncomeFields };
  }
  return { error: "income not found" };
};
