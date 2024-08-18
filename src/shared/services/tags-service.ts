import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "../db";
import { getLogger } from "../utils";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import ms from "ms";

export enum TagBelongsTo {
  Purchase = "purchase",
  PaymentAccounts = "pymt-acc",
  PurchaseTypeConfig = "purchase-type-config",
  PaymentAccountTypeConfig = "pymt-acc-type-config",
}

interface TagResource {
  belongsTo: TagBelongsTo;
  value: string;
}

export const TagsService = () => {
  const tagsDb = new MyLocalDatabase<TagResource>(LocalDBStore.Tags);
  const _logger = getLogger("service.tags");

  const updateTags = async (belongsTo: TagBelongsTo, tags: string | string[]) => {
    const logger = getLogger("updateTags." + belongsTo, _logger);
    const tagSet = new Set(tags);
    logger.debug("received [", tagSet.size, "] tags to update to db");

    const promises = [...tagSet].map(async (tag) => {
      const resource: TagResource = {
        value: tag,
        belongsTo: belongsTo,
      };
      await tagsDb.addUpdateItem(resource);
    });
    await Promise.all(promises);
    logger.debug("db operation completed");
  };

  const getTags = async (belongsTo: TagBelongsTo) => {
    const logger = getLogger("getTags." + belongsTo, _logger);
    const list = await tagsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, belongsTo);
    logger.debug("retrieved [", list.length, "] list of tags");
    return list.map((tr) => tr.value);
  };

  const getCount = async (belongsTo: TagBelongsTo) => {
    return await tagsDb.countFromIndex(LocalDBStoreIndex.BelongsTo, belongsTo);
  };

  return {
    getCount: pMemoize(getCount, { cache: new ExpiryMap(ms("10 sec")), cacheKey: JSON.stringify }),
    getTags: pMemoize(getTags, { cache: new ExpiryMap(ms("10 sec")), cacheKey: JSON.stringify }),
    updateTags,
    // updatePurchaseTags : async (purchase: PurchaseFields) => {
    //   const logger = getLogger("updatePurchaseTags", _logger);
    //   const purchaseTags = purchase.tags;
    //   logger.debug("purchase tags size: ", purchaseTags.length);
    //   const purchaseItemTags = purchase.items?.flatMap((ei) => ei.tags) || [];
    //   logger.debug("purchase item tags size: ", purchaseItemTags.length);
    //   const tags = [...purchaseTags, ...purchaseItemTags];
    //   const promises = tags.map(async (tag) => {
    //     const resource: TagResource = {
    //       value: tag,
    //       belongsTo: TagBelongsTo.Purchase,
    //     };
    //     await tagsDb.addUpdateItem(resource);
    //   });
    //   await Promise.all(promises);
    //   logger.debug("add update tags completed");
    // },
  };
};
