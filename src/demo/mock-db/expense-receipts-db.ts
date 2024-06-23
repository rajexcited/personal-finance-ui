import { v4 as uuidv4 } from "uuid";
import { getLogger } from "../../services";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { isValidUuid } from "../services/common-validators";

const _logger = getLogger("expense.receipts");
const receiptDb = new MyLocalDatabase<DbReceiptFileResource>(LocalDBStore.Receipt);

interface DbReceiptFileResource {
  filedata: ArrayBuffer;
  name: string;
  id: string;
  createdOn: Date;
  expenseId: string;
}

export const getReceiptFileData = async (expenseId: string, receiptId: string) => {
  if (!isValidUuid(receiptId)) {
    return { error: "receipt data not found" };
  }
  const dbItem = await receiptDb.getItem(receiptId);
  if (dbItem?.expenseId !== expenseId) {
    return { error: "receipt data not found" };
  }

  return { data: dbItem.filedata };
};

export const updateExpenseIdForReceipt = async (newExpenseId: string, oldExpenseId: string, receiptName: string) => {
  const items = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseReceiptName, [receiptName, oldExpenseId]);
  if (items.length !== 1) {
    return { error: "receipt not found" };
  }
  if (newExpenseId === oldExpenseId) {
    return { id: items[0].id };
  }
  const updatingDbItem: DbReceiptFileResource = {
    ...items[0],
    expenseId: newExpenseId,
  };
  await receiptDb.addUpdateItem(updatingDbItem);
  return { id: updatingDbItem.id };
};

export const saveReceiptFileData = async (file: File, expenseId: string, receiptName: string) => {
  const dbItem: DbReceiptFileResource = {
    filedata: await file.arrayBuffer(),
    id: uuidv4(),
    name: receiptName,
    createdOn: new Date(),
    expenseId: expenseId,
  };
  await receiptDb.addItem(dbItem);
};

export const deleteReceiptFileData = async (expenseId: string, receiptId?: string) => {
  if (receiptId) {
    if (isValidUuid(receiptId)) {
      const dbItem = await receiptDb.getItem(receiptId);
      if (dbItem?.expenseId === expenseId) {
        await receiptDb.delete(dbItem.id);
        return { deleted: [dbItem.id] };
      }
    }
    return { error: "receipt data not found" };
  }
  const receipts = await receiptDb.getAllFromIndex(LocalDBStoreIndex.ExpenseId, expenseId);
  const deletedReceiptIdPromises = receipts.map(async (item) => {
    await receiptDb.delete(item.id);
    return item.id;
  });
  return { deleted: await Promise.all(deletedReceiptIdPromises) };
};
