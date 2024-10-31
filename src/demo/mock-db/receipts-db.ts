import { v4 as uuidv4 } from "uuid";
import { getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { isValidUuid } from "../services/common-validators";
import { ExpenseBelongsTo } from "../../pages/expenses/services";

const _rootLogger = getLogger("mock.db.expense.purchase.receipts");
const receiptDb = new MyLocalDatabase<DbReceiptFileResource>(LocalDBStore.Receipt);

interface DbReceiptFileResource {
  filedata: ArrayBuffer;
  name: string;
  id: string;
  createdOn: Date;
  relationId: string;
  belongsTo: ExpenseBelongsTo;
}

export const getReceiptFileData = async (purchaseId: string, receiptId: string, belongsTo: ExpenseBelongsTo) => {
  if (!isValidUuid(receiptId)) {
    return { error: "receipt data not found" };
  }
  const dbItem = await receiptDb.getItem(receiptId);
  if (dbItem?.relationId !== purchaseId || dbItem.belongsTo !== belongsTo) {
    return { error: "receipt data not found" };
  }

  return { data: dbItem.filedata };
};

const updateRelationIdForReceipt = async (newRelationId: string, oldRelationId: string, receiptName: string, belongsTo: ExpenseBelongsTo) => {
  const logger = getLogger("updateRelationIdForReceipt." + belongsTo, _rootLogger);
  const items = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseReceiptName, [receiptName, oldRelationId]);
  if (items.length !== 1 || items[0].belongsTo !== belongsTo) {
    return { error: "receipt not found" };
  }
  if (newRelationId === oldRelationId) {
    return { id: items[0].id };
  }
  logger.debug("updating relationId for receipt");
  const updatingDbItem: DbReceiptFileResource = {
    ...items[0],
    relationId: newRelationId,
  };
  await receiptDb.addUpdateItem(updatingDbItem);
  return { id: updatingDbItem.id };
};

export const updatePurchaseIdForReceipt = async (newPurchaseId: string, oldPurchaseId: string, receiptName: string) => {
  return await updateRelationIdForReceipt(newPurchaseId, oldPurchaseId, receiptName, ExpenseBelongsTo.Purchase);
};
export const updateIncomeIdForReceipt = async (newIncomeId: string, oldIncomeId: string, receiptName: string) => {
  return await updateRelationIdForReceipt(newIncomeId, oldIncomeId, receiptName, ExpenseBelongsTo.Income);
};
export const updateRefundIdForReceipt = async (newRefundId: string, oldRefundId: string, receiptName: string) => {
  return await updateRelationIdForReceipt(newRefundId, oldRefundId, receiptName, ExpenseBelongsTo.PurchaseRefund);
};

export const saveReceiptFileData = async (file: File, relationId: string, receiptName: string, belongsTo: ExpenseBelongsTo) => {
  const dbItem: DbReceiptFileResource = {
    filedata: await file.arrayBuffer(),
    id: uuidv4(),
    name: receiptName,
    createdOn: new Date(),
    relationId: relationId,
    belongsTo: belongsTo,
  };
  await receiptDb.addItem(dbItem);
};

export const deleteReceiptFileData = async (relationId: string, receiptId?: string) => {
  if (receiptId) {
    if (isValidUuid(receiptId)) {
      const dbItem = await receiptDb.getItem(receiptId);
      if (dbItem?.relationId === relationId) {
        await receiptDb.delete(dbItem.id);
        return { deleted: [dbItem.id] };
      }
    }
    return { error: "receipt data not found" };
  }
  const receipts = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseId, relationId);
  const deletedReceiptIdPromises = receipts.map(async (item) => {
    await receiptDb.delete(item.id);
    return item.id;
  });
  return { deleted: await Promise.all(deletedReceiptIdPromises) };
};
