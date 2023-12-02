import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";

const objectStoreName = "receipt-files";

const db = await openDB("mock-expense-receipts", 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    console.debug("in mock expense receipt db upgrade", db, oldVersion, newVersion, transaction, event);
    if (!db.objectStoreNames.contains(objectStoreName)) {
      const store = db.createObjectStore(objectStoreName, { keyPath: "fileId" });
    } else {
      console.log(objectStoreName, "receipt count", db.count(objectStoreName));
    }
  },
});

console.log(objectStoreName, "receipt count", db.count(objectStoreName));

interface DbReceiptType {
  filedata: ArrayBuffer;
  name: string;
  fileId: string;
  type: string;
  lastModifiedDate: Date;
}

interface ReceiptType {
  file: File;
  id: string;
  lastUpdatedDate: Date;
  url: string;
}

export const Receipts = {
  get: async (receiptId: string): Promise<ReceiptType | null> => {
    if ((await db.count(objectStoreName, receiptId)) === 0) {
      return null;
    }
    const result = (await db.get(objectStoreName, receiptId)) as DbReceiptType;
    const file = new File([result.filedata], result.name, {
      lastModified: result.lastModifiedDate.getTime(),
      type: result.type,
    });

    return {
      file: file,
      id: result.fileId,
      lastUpdatedDate: result.lastModifiedDate,
      url: URL.createObjectURL(file),
    };
  },

  save: async (file: File, id?: string): Promise<ReceiptType> => {
    if (!id) {
      id = uuidv4();
    }
    if ((await db.count(objectStoreName, id)) !== 0) {
      return await Receipts.save(file, uuidv4());
    }
    const dbValue: DbReceiptType = {
      filedata: await file.arrayBuffer(),
      fileId: id,
      lastModifiedDate: new Date(),
      name: file.name,
      type: file.type,
    };
    await db.add(objectStoreName, dbValue);
    return {
      id,
      file,
      lastUpdatedDate: dbValue.lastModifiedDate,
      url: URL.createObjectURL(file),
    };
  },
};
