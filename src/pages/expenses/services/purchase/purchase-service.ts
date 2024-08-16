import {
  axios,
  convertAuditFieldsToDateInstance,
  handleRestErrors,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  parseTimestamp,
  formatTimestamp,
  subtractDates,
  LoggerBase,
  getDefaultIfError,
  ConfigTypeStatus,
  TagsService,
  TagBelongsTo,
} from "../../../../services";
import { DownloadReceiptResource, ErrorReceiptProps, PurchaseFields, PurchaseItemFields, ReceiptProps } from "./field-types";
import { PurchaseTypeService } from "./purchase-type-service";
import { PymtAccountService } from "../../../pymt-accounts";
import { ReceiptUploadError } from "./receipt-error";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import { validate as isValidUuid, version as getUuidVersion } from "uuid";
import ms from "ms";
import pDebounce from "p-debounce";

type PurchaseTagQueryParams = Record<"purchasedYear", string[]>;
type CacheAction = "AddUpdateGet" | "Remove";

export const PurchaseService = () => {
  const onBeforeExpiredReceiptFileCallback = async (item: DownloadReceiptResource) => {
    if (item.status === "success") {
      URL.revokeObjectURL(item.url);
    }
  };

  const expenseDb = new MyLocalDatabase<PurchaseFields>(LocalDBStore.Expense);
  const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile, onBeforeExpiredReceiptFileCallback);

  const pymtAccService = PymtAccountService();
  const purchaseTypeService = PurchaseTypeService();
  const tagService = TagsService();

  const rootPath = "/expenses/purchase";
  const _logger = getLogger("service.expense.purchase");

  const getPurchaseTypeEnum = pMemoize(
    async () => {
      const logger = getLogger("getPurchaseTypeEnum", _logger);
      const startTime = new Date();
      logger.info("cache miss. calling service to get purchase types");
      const types = await getDefaultIfError(purchaseTypeService.getTypes, []);
      const typeMap = new Map<string, string>();
      types.forEach((ctg) => {
        typeMap.set(ctg.id, ctg.name);
        typeMap.set(ctg.name, ctg.id);
      });
      logger.info("transformed to type Map, ", typeMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
      return typeMap;
    },
    { cache: new ExpiryMap(ms("15 sec")) }
  );

  const getDeletedPurchaseTypeEnum = pMemoize(
    async () => {
      const logger = getLogger("getDeletedPurchaseTypeEnum", _logger);
      const startTime = new Date();
      logger.info("cache miss. calling service to get purchase types");
      const types = await getDefaultIfError(async () => await purchaseTypeService.getTypes(ConfigTypeStatus.Deleted), []);
      const typeMap = new Map<string, string>();
      types.forEach((ctg) => {
        typeMap.set(ctg.id, ctg.name);
        typeMap.set(ctg.name, ctg.id);
      });
      logger.info("transformed to type Map, ", typeMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
      return typeMap;
    },
    { cache: new ExpiryMap(ms("15 sec")) }
  );

  const getPaymentAccountMap = async () => {
    const logger = getLogger("getPaymentAccountMap", _logger);
    const startTime = new Date();

    const pymtAccs = await getDefaultIfError(pymtAccService.getPymtAccountList, []);
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
    { cache: new ExpiryMap(ms("15 sec")) }
  );

  const isUuid = (id: string | null | undefined) => {
    if (id && isValidUuid(id) && getUuidVersion(id) === 4) {
      return true;
    }
    return false;
  };

  const updatePurchaseType = (categoryMap: Map<string, string>, item: PurchaseFields | PurchaseItemFields) => {
    if (item.purchaseTypeId && isUuid(item.purchaseTypeId) && categoryMap.get(item.purchaseTypeId)) {
      item.purchaseTypeName = categoryMap.get(item.purchaseTypeId);
    }
  };

  const updatePymtAcc = (pymtAccMap: Map<string, string>, item: PurchaseFields) => {
    if (item.paymentAccountId && isUuid(item.paymentAccountId) && pymtAccMap.get(item.paymentAccountId)) {
      item.paymentAccountName = pymtAccMap.get(item.paymentAccountId);
    }
  };

  const updatePurchaseTypeAndPymtAccName = async (purchaseItem: PurchaseFields) => {
    const logger = getLogger("updatePurchaseTypeAndPymtAccName", _logger);
    let startTime = new Date();
    const typeMap = await getPurchaseTypeEnum();
    const pymtAccMap = await getPymtAccEnum();
    updatePurchaseType(typeMap, purchaseItem);
    updatePymtAcc(pymtAccMap, purchaseItem);
    if (purchaseItem.items) {
      purchaseItem.items.forEach((itemBreakdown) => {
        updatePurchaseType(typeMap, itemBreakdown);
      });
    }

    const shouldRetrieveDeletedCategories = (item: PurchaseFields | PurchaseItemFields) => item.purchaseTypeId && !item.purchaseTypeName;
    if (shouldRetrieveDeletedCategories(purchaseItem) || !!purchaseItem.items?.find(shouldRetrieveDeletedCategories)) {
      const deletedTypeMap: Map<string, string> = await getDeletedPurchaseTypeEnum();
      if (shouldRetrieveDeletedCategories(purchaseItem)) {
        updatePurchaseType(deletedTypeMap, purchaseItem);
      }
      purchaseItem.items?.filter(shouldRetrieveDeletedCategories).forEach((itemBreakdown) => {
        updatePurchaseType(deletedTypeMap, itemBreakdown);
      });
    }

    if (purchaseItem.paymentAccountId && !purchaseItem.paymentAccountName) {
      const pymtAccId = purchaseItem.paymentAccountId;
      const deletedPymtAcc = await getDefaultIfError(async () => await pymtAccService.getPymtAccount(pymtAccId), null);
      purchaseItem.paymentAccountName = deletedPymtAcc?.shortName;
    }
    logger.info("execution time =", subtractDates(null, startTime).toSeconds(), " sec");
  };

  const updatePurchaseTags = async (purchase: PurchaseFields) => {
    const logger = getLogger("updatePurchaseTags", _logger);
    const purchaseTags = purchase.tags;
    logger.debug("purchase tags size: ", purchaseTags.length);
    const purchaseItemTags = purchase.items?.flatMap((ei) => ei.tags) || [];
    logger.debug("purchase item tags size: ", purchaseItemTags.length);
    const tags = [...purchaseTags, ...purchaseItemTags];
    await tagService.updateTags(TagBelongsTo.Purchase, tags);
    logger.debug("add update tags completed");
  };

  const addUpdateDbPurchase = async (purchase: PurchaseFields, loggerBase: LoggerBase) => {
    // here we don't have url or file prop in receipts
    const logger = getLogger("addUpdateDbPurchase", loggerBase);
    const transformStart = new Date();
    const dbPurchase: PurchaseFields = {
      ...purchase,
      purchasedDate: typeof purchase.purchasedDate === "string" ? parseTimestamp(purchase.purchasedDate) : purchase.purchasedDate,
      verifiedTimestamp: typeof purchase.verifiedTimestamp === "string" ? parseTimestamp(purchase.verifiedTimestamp) : purchase.verifiedTimestamp,
    };
    await updatePurchaseTypeAndPymtAccName(dbPurchase);
    convertAuditFieldsToDateInstance(dbPurchase.auditDetails);
    dbPurchase.receipts = dbPurchase.receipts.map((rct) => ({ ...rct, purchaseId: purchase.id }));
    await initializePurchaseTags();
    await updatePurchaseTags(dbPurchase);

    logger.info("transforming execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    await expenseDb.addUpdateItem(dbPurchase);
    logger.info("dbPurchase =", dbPurchase, ", execution time =", subtractDates(null, transformStart).toSeconds(), " sec");
    return dbPurchase;
  };

  const initializePurchaseTags = async () => {
    const tagCount = await tagService.getCount(TagBelongsTo.Purchase);
    if (tagCount > 0) {
      return;
    }

    const thisYear = new Date().getFullYear();
    const queryParams: PurchaseTagQueryParams = {
      purchasedYear: [String(thisYear), String(thisYear - 1)],
    };
    const response = await axios.get(`${rootPath}/tags`, { params: queryParams });
    await tagService.updateTags(TagBelongsTo.Purchase, response.data);
  };

  const cacheReceiptFile = async (receipt: ReceiptProps, action: CacheAction, fileData?: ArrayBuffer, newReceipt?: ReceiptProps) => {
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
            purchaseId: newReceipt.purchaseId,
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
          purchaseId: newReceipt?.purchaseId || receipt.purchaseId,
          url: receipturl,
        };
        await receiptFileDb.addItem(result);
        return { ...result };
      }
    }
  };

  return {
    getPurchase: pDebounce(async (purchaseId: string) => {
      const logger = getLogger("getPurchase", _logger);

      try {
        const dbPurchase = await expenseDb.getItem(purchaseId);

        if (dbPurchase && dbPurchase.items) {
          return dbPurchase;
        }

        const response = await axios.get(rootPath + "/id/" + purchaseId);
        return addUpdateDbPurchase(response.data, logger);
      } catch (e) {
        const err = e as Error;
        handleRestErrors(err, logger);
        logger.warn("not rest error", e);
        throw Error("unknown error");
      }
    }, ms("1 sec")),

    addUpdatePurchase: async (purchase: PurchaseFields) => {
      const logger = getLogger("addUpdatePurchase", _logger);

      try {
        await updatePurchaseTypeAndPymtAccName(purchase);
        const data: PurchaseFields = {
          ...purchase,
          purchasedDate: purchase.purchasedDate instanceof Date ? formatTimestamp(purchase.purchasedDate) : purchase.purchasedDate,
          verifiedTimestamp: purchase.verifiedTimestamp instanceof Date ? formatTimestamp(purchase.verifiedTimestamp) : purchase.verifiedTimestamp,
        };
        const response = await axios.post(rootPath, data);

        const purchaseReceipts = purchase.receipts.reduce((obj: Record<string, ReceiptProps>, rct) => {
          obj[rct.name] = rct;
          return obj;
        }, {});

        const updateReceiptIdPromises = (response.data as PurchaseFields).receipts.map(async (rct) => {
          await cacheReceiptFile(purchaseReceipts[rct.name], "AddUpdateGet", undefined, rct);
        });
        await Promise.all(updateReceiptIdPromises);

        // cleaning memory if receipt object is removed
        const existing = await expenseDb.getItem(response.data.id);
        if (existing) {
          const deleteReceiptPromises = existing.receipts.map(async (rct) => {
            if (!purchaseReceipts[rct.name]) {
              await cacheReceiptFile(rct, "Remove");
            }
          });
          await Promise.all(deleteReceiptPromises);
        }

        await addUpdateDbPurchase(response.data, logger);
      } catch (e) {
        const err = e as Error;
        handleRestErrors(err, logger);
        logger.warn("not rest error", e);
        throw Error("unknown error");
      }
    },

    removePurchase: async (purchaseId: string) => {
      const logger = getLogger("removePurchase", _logger);

      try {
        const response = await axios.delete(rootPath + "/id/" + purchaseId);
        await addUpdateDbPurchase(response.data, logger);
        const deletingReceiptPromises = (response.data as PurchaseFields).receipts.map(async (rct) => {
          await cacheReceiptFile(rct, "Remove");
        });
        await Promise.all(deletingReceiptPromises);
      } catch (e) {
        const err = e as Error;
        handleRestErrors(err, logger);
        logger.warn("not rest error", e);
        throw Error("unknown error");
      }
    },

    getPaymentAccountMap: async () => {
      const logger = getLogger("getPaymentAccountMap", _logger);
      const startTime = new Date();

      const pymtAccs = await getDefaultIfError(pymtAccService.getPymtAccountList, []);
      const pymtAccMap = new Map<string, string>();
      pymtAccs.forEach((acc) => {
        pymtAccMap.set(acc.id, acc.shortName);
      });
      logger.info("transformed to pymt acc Map, ", pymtAccMap, ", execution Time =", subtractDates(null, startTime).toSeconds(), " sec");
      return pymtAccMap;
    },

    getPurchaseTags: async () => {
      const tagList = await tagService.getTags(TagBelongsTo.Purchase);
      return tagList;
    },

    updatePurchaseReceipts: async (receipts: ReceiptProps[]) => {
      const logger = getLogger("updatePurchaseReceipts", _logger);
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
          await axios.post(`${rootPath}/id/${rct.purchaseId}/receipts/id/${rct.name}`, rct.file, {
            headers: { "Content-Type": rct.contentType },
          });
          const result: ReceiptProps = {
            name: rct.name,
            contentType: rct.contentType,
            id: rct.id,
            purchaseId: rct.purchaseId,
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
    },

    downloadReceipts: async (receipts: ReceiptProps[]) => {
      const logger = getLogger("downloadReceipts", _logger);
      logger.debug("starting to download and prepare resource list");

      const promises = receipts.map(async (rct) => {
        try {
          const cachedReceiptResponse = await cacheReceiptFile(rct, "AddUpdateGet");
          if (cachedReceiptResponse) {
            return cachedReceiptResponse as DownloadReceiptResource;
          }
          const fileResponse = await axios.get(`${rootPath}/id/${rct.purchaseId}/receipts/id/${rct.id}`, { responseType: "blob" });
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
            purchaseId: rct.purchaseId,
          };
          return errorResponse;
        }
      });
      return await Promise.all(promises);
    },

    cacheReceiptFile,

    getPurchaseTypes: () => {
      return purchaseTypeService.getTypes(ConfigTypeStatus.Enable);
    },
  };
};

(() => {
  const logger = getLogger("onPageLoad");
  const receiptFileDb = new MyLocalDatabase<DownloadReceiptResource>(LocalDBStore.ReceiptFile);
  logger.debug("deleting all receipt urls");
  receiptFileDb.clearAll();
})();
