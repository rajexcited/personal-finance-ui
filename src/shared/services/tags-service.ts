import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "../db";
import { getLogger } from "../utils";

export type TagQueryParams = Record<"year", string[]>;

export enum TagBelongsTo {
  Purchase = "purchase",
  PurchaseRefund = "purchase-refund",
  PaymentAccounts = "pymt-acc",
  PurchaseTypeConfig = "purchase-type-config",
  PaymentAccountTypeConfig = "pymt-acc-type-config",
  RefundReasonConfig = "refund-reason-config",
  Income = "income",
  IncomeTypeConfig = "income-type-config",
}

interface TagResource {
  belongsTo: TagBelongsTo;
  value: string;
}

export const TagsService = (belongsTo: TagBelongsTo) => {
  const tagsDb = new MyLocalDatabase<TagResource>(LocalDBStore.Tags);
  const _logger = getLogger("service.tags");

  return {
    updateTags: async (tags: string | string[]) => {
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
    },

    getTags: async () => {
      const logger = getLogger("getTags." + belongsTo, _logger);
      const list = await tagsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, belongsTo);
      logger.debug("retrieved [", list.length, "] list of tags");
      return list.map((tr) => tr.value);
    },

    getCount: async () => {
      return await tagsDb.countFromIndex(LocalDBStoreIndex.BelongsTo, belongsTo);
    },
  };
};
