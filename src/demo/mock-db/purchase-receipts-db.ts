import { v4 as uuidv4 } from "uuid";
import { getLogger } from "../../shared";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { isValidUuid } from "../services/common-validators";

const _rootLogger = getLogger("mock.db.expense.purchase.receipts");
const receiptDb = new MyLocalDatabase<DbReceiptFileResource>(LocalDBStore.Receipt);

interface DbReceiptFileResource {
  filedata: ArrayBuffer;
  name: string;
  id: string;
  createdOn: Date;
  purchaseId: string;
}

export const getReceiptFileData = async (purchaseId: string, receiptId: string) => {
  if (!isValidUuid(receiptId)) {
    return { error: "receipt data not found" };
  }
  const dbItem = await receiptDb.getItem(receiptId);
  if (dbItem?.purchaseId !== purchaseId) {
    return { error: "receipt data not found" };
  }

  return { data: dbItem.filedata };
};

export const updatePurchaseIdForReceipt = async (newPurchaseId: string, oldPurchaseId: string, receiptName: string) => {
  const logger = getLogger("updatePurchaseIdForReceipt", _rootLogger);
  const items = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseReceiptName, [receiptName, oldPurchaseId]);
  if (items.length !== 1) {
    return { error: "receipt not found" };
  }
  if (newPurchaseId === oldPurchaseId) {
    return { id: items[0].id };
  }
  logger.debug("updating purchaseId for receipt");
  const updatingDbItem: DbReceiptFileResource = {
    ...items[0],
    purchaseId: newPurchaseId,
  };
  await receiptDb.addUpdateItem(updatingDbItem);
  return { id: updatingDbItem.id };
};

export const saveReceiptFileData = async (file: File, purchaseId: string, receiptName: string) => {
  const dbItem: DbReceiptFileResource = {
    filedata: await file.arrayBuffer(),
    id: uuidv4(),
    name: receiptName,
    createdOn: new Date(),
    purchaseId: purchaseId,
  };
  await receiptDb.addItem(dbItem);
};

export const deleteReceiptFileData = async (purchaseId: string, receiptId?: string) => {
  if (receiptId) {
    if (isValidUuid(receiptId)) {
      const dbItem = await receiptDb.getItem(receiptId);
      if (dbItem?.purchaseId === purchaseId) {
        await receiptDb.delete(dbItem.id);
        return { deleted: [dbItem.id] };
      }
    }
    return { error: "receipt data not found" };
  }
  const receipts = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseId, purchaseId);
  const deletedReceiptIdPromises = receipts.map(async (item) => {
    await receiptDb.delete(item.id);
    return item.id;
  });
  return { deleted: await Promise.all(deletedReceiptIdPromises) };
};
