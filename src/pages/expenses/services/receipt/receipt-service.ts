import { axios, getLogger, MyLocalDatabase, LocalDBStore, InvalidError, handleRestErrors } from "../../../../shared";
import { CacheAction, DownloadReceiptResource, ErrorReceiptProps, ReceiptProps, ReceiptUploadError } from "../../../../components/receipt";

const onBeforeExpiredReceiptFileCallback = async (item: DownloadReceiptResource) => {
  if (item.status === "success") {
    URL.revokeObjectURL(item.url);
  }
};

const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile, onBeforeExpiredReceiptFileCallback);

const rootPath = "/expenses";
const _logger = getLogger("service.expense.receipt", null, null, "DISABLED");

export const cacheReceiptFile = async (
  receipt: ReceiptProps,
  action: CacheAction,
  fileData?: ArrayBuffer,
  newReceipt?: ReceiptProps
): Promise<DownloadReceiptResource | undefined> => {
  const resp = await receiptFileDb.getItem(receipt.id);

  if (newReceipt && newReceipt.belongsTo !== receipt.belongsTo) {
    throw new InvalidError("cannot change the receipt belongs to from [" + receipt.belongsTo + "] to [" + newReceipt.belongsTo + "]");
  }

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
          relationId: newReceipt.relationId,
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
        relationId: newReceipt?.relationId || receipt.relationId,
        url: receipturl,
        belongsTo: newReceipt?.belongsTo || receipt.belongsTo,
      };
      await receiptFileDb.addItem(result);
      return { ...result };
    }
  }
};

export const uploadReceipts = async (receipts: ReceiptProps[]) => {
  const logger = getLogger("uploadReceipts", _logger);
  // make sure to have unique names
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
      await axios.post(`${rootPath}/${rct.belongsTo}/id/${rct.relationId}/receipts/id/${rct.id}`, rct.file, {
        headers: { "Content-Type": rct.contentType },
      });

      const result: ReceiptProps = {
        name: rct.name,
        contentType: rct.contentType,
        id: rct.id,
        relationId: rct.relationId,
        belongsTo: rct.belongsTo,
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

export const downloadReceipts = async (receipts: ReceiptProps[]) => {
  const logger = getLogger("downloadReceipts", _logger);
  logger.debug("starting to download and prepare resource list");

  const promises = receipts.map(async (rct) => {
    try {
      const cachedReceiptResponse = await cacheReceiptFile(rct, CacheAction.AddUpdateGet);
      if (cachedReceiptResponse) {
        return cachedReceiptResponse as DownloadReceiptResource;
      }
      const fileResponse = await axios.get(`${rootPath}/${rct.belongsTo}/id/${rct.relationId}/receipts/id/${rct.id}`, { responseType: "blob" });
      const downloadReceiptResponse = await cacheReceiptFile(rct, CacheAction.AddUpdateGet, fileResponse.data);
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
        relationId: rct.relationId,
        belongsTo: rct.belongsTo,
      };
      return errorResponse;
    }
  });
  return await Promise.all(promises);
};

(() => {
  const logger = getLogger("onPageLoad", _logger);
  const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile);
  logger.debug("deleting all receipt urls");
  receiptFileDb.clearAll();
})();
