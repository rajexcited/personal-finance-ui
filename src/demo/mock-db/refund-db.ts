import { v4 as uuidv4 } from "uuid";
import datetime from "date-and-time";
import { ExpenseStatus } from "../../pages/expenses";
import { ConfigTypeBelongsTo, LoggerBase, ObjectDeepDifference, formatTimestamp, getDate, getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { auditData } from "../services/userDetails";
import { deleteReceiptFileData, updateRefundIdForReceipt } from "./receipts-db";
import { getPymtAccountList } from "./pymt-acc-db";
import { ExpenseBelongsTo, PurchaseFields, PurchaseItemFields, PurchaseRefundFields } from "../../pages/expenses/services";
import { ReceiptProps } from "../../components/receipt";
import { JSONObject } from "../../shared/utils/deep-obj-difference";
import { getConfigTypes, getDefaultCurrencyProfileId, getRefundReasons } from "./config-type-db";
import ms from "ms";
import { ExpenseFilter } from "./expense-db";

const refundDb = new MyLocalDatabase<PurchaseRefundFields>(LocalDBStore.Expense);

const _rootLogger = getLogger("mock.db.expense.purchase.refund", null, null, "DISABLED");

// initialize on page load
const init = async () => {
  const logger = getLogger("init", _rootLogger);

  const refundReasons = (await getRefundReasons()).list;
  logger.debug("retrieved", refundReasons.length, "refund reasons");

  const reasonId = (reasonValue: string) => {
    return refundReasons.find((rfnrsn) => rfnrsn.value === reasonValue)?.id || "NA";
  };

  const paymentAccounts = (await getPymtAccountList()).list;
  logger.debug("retrieved", paymentAccounts.length, "payment accounts");
  const pymtAccId = (accname: string) => {
    return paymentAccounts.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id;
  };

  const refunds = await refundDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.PurchaseRefund);
  logger.debug("retrieved", refunds.length, "refunds");

  if (refunds.length > 0) {
    return;
  }

  logger.debug("creating sample refunds");
  const purchaseDb = new MyLocalDatabase<PurchaseFields>(LocalDBStore.Expense);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let matchedPurchase = undefined;
  do {
    await sleep(ms("1 sec"));
    const purchases = await purchaseDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.Purchase);
    matchedPurchase = purchases.find((prch) => prch.items?.find((prchitm) => prchitm.tags.includes("utensil")));
  } while (matchedPurchase === undefined);
  const matchedPurchedItem = matchedPurchase.items?.find((prchitm) => prchitm.tags.includes("utensil")) as PurchaseItemFields;

  const currencyProfileId = await getDefaultCurrencyProfileId();

  await refundDb.addItem({
    id: uuidv4(),
    billName: "returning " + matchedPurchedItem.billName,
    amount: matchedPurchedItem.amount as string,
    description: "this is dummy refund for demo purpose",
    tags: "".split(","),
    paymentAccountId: pymtAccId("cash"),
    refundDate: formatTimestamp(datetime.addDays(new Date(), -1)),
    reasonId: reasonId("broken"),
    reasonValue: "broken",
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    belongsTo: ExpenseBelongsTo.PurchaseRefund,
    purchaseId: matchedPurchase.id,
    personIds: [],
    currencyProfileId: currencyProfileId,
  });
  await refundDb.addItem({
    id: uuidv4(),
    billName: "returned gift",
    amount: "12.22",
    description: "this is dummy refund for demo purpose",
    tags: "gift,entertainment".split(","),
    paymentAccountId: pymtAccId("cash"),
    refundDate: formatTimestamp(new Date()),
    reasonId: reasonId("dont like"),
    reasonValue: "dont like",
    receipts: [],
    auditDetails: auditData(),
    status: ExpenseStatus.Enable,
    belongsTo: ExpenseBelongsTo.PurchaseRefund,
    personIds: [],
    currencyProfileId: currencyProfileId,
  });
};

await init();

export type RefundFilter = ExpenseFilter;

export const getRefundTags = async (years: number[]) => {
  const logger = getLogger("getRefundTags", _rootLogger);

  const refundList = await refundDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ExpenseBelongsTo.PurchaseRefund);
  logger.debug("retrieved", refundList.length, "refund. now filtering by year");

  logger.debug("years =", years);
  const taglist = refundList
    .filter((ri) => {
      const year = getDate(ri.refundDate).getFullYear();
      return years.includes(year);
    })
    .flatMap((ri) => ri.tags);

  return { list: taglist };
};

export const getRefundDetails = async (refundId: string) => {
  const existingRefund = await refundDb.getItem(refundId);
  if (existingRefund && existingRefund.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
    const details: PurchaseRefundFields = {
      ...existingRefund,
    };
    return { getDetails: details };
  }
  return { error: "refund not found" };
};

const getReceiptsForRefundAddUpdate = async (
  oldRefundReceipts: ReceiptProps[],
  newRefundReceipts: ReceiptProps[],
  oldRefundId: string,
  newRefundId: string,
  logger: LoggerBase
) => {
  const existingRefundReceipts = oldRefundReceipts.reduce((obj: Record<string, ReceiptProps>, r) => {
    obj[r.id] = r;
    return obj;
  }, {});
  const noChangeExistingReceipts = newRefundReceipts.map((r) => existingRefundReceipts[r.id]).filter((r) => r);

  const addedNewReceiptPromises = newRefundReceipts
    .filter((r) => !existingRefundReceipts[r.id])
    .map(async (r) => {
      const receiptIdResult = await updateRefundIdForReceipt(newRefundId, oldRefundId, r.name);
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

  const newRefundReceiptIds = newRefundReceipts.map((r) => r.id);
  const removingExistingReceipts = oldRefundReceipts.filter((r) => !newRefundReceiptIds.includes(r.id));
  const removingPromises = removingExistingReceipts.map(async (r) => {
    return await deleteReceiptFileData(oldRefundId, r.id);
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

export const addUpdateRefund = async (data: PurchaseRefundFields) => {
  const logger = getLogger("addUpdate", _rootLogger);
  const existingRefund = await refundDb.getItem(data.id);

  if (existingRefund) {
    logger.info(
      "updating existing refund found. difference (data-existingRefund) =",
      ObjectDeepDifference(data as unknown as JSONObject, existingRefund as unknown as JSONObject)
    );
    const receiptResult = await getReceiptsForRefundAddUpdate(existingRefund.receipts, data.receipts, existingRefund.id, existingRefund.id, logger);
    if (receiptResult.error) {
      return { error: receiptResult.error };
    }

    const updatedRefund: PurchaseRefundFields = {
      ...data,
      status: ExpenseStatus.Enable,
      receipts: receiptResult.list || [],
      auditDetails: auditData(existingRefund.auditDetails.createdBy, existingRefund.auditDetails.createdOn),
      currencyProfileId: await getDefaultCurrencyProfileId(),
    };

    delete updatedRefund.paymentAccountName;
    await refundDb.addUpdateItem(updatedRefund);
    return { updated: updatedRefund };
  }

  const newRefundId = uuidv4();
  const receiptResult = await getReceiptsForRefundAddUpdate([], data.receipts, data.id, newRefundId, logger);
  if (receiptResult.error) {
    return { error: receiptResult.error };
  }
  const addedRefund: PurchaseRefundFields = {
    ...data,
    id: newRefundId,
    status: ExpenseStatus.Enable,
    receipts: data.receipts.map((r) => ({ ...r, id: uuidv4(), relationId: "", url: "" })),
    auditDetails: auditData(),
    currencyProfileId: await getDefaultCurrencyProfileId(),
  };

  await refundDb.addUpdateItem(addedRefund);
  return { added: addedRefund };
};

export const deleteRefund = async (refundId: string) => {
  const existingRefund = await refundDb.getItem(refundId);
  if (existingRefund && existingRefund.belongsTo === ExpenseBelongsTo.PurchaseRefund) {
    const deletingRefund = {
      ...existingRefund,
      status: ExpenseStatus.Deleted,
      auditDetails: auditData(existingRefund.auditDetails.createdBy, existingRefund.auditDetails.createdOn),
    };
    await refundDb.addUpdateItem(deletingRefund);
    return { deleted: { ...deletingRefund } as PurchaseRefundFields };
  }
  return { error: "refund not found" };
};
