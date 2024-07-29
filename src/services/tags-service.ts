import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { getLogger } from "./logger";
import { ExpenseFields } from "../pages/expenses";

export enum TagBelongsTo {
  Expenses = "expenses",
  PaymentAccounts = "pymt-acc",
  ExpenseCategoryConfig = "expense-category-config",
  PaymentAccountTypeConfig = "pymt-acc-type-config",
}

interface TagResource {
  belongsTo: TagBelongsTo;
  value: string;
}

export const TagsService = () => {
  const tagsDb = new MyLocalDatabase<TagResource>(LocalDBStore.Tags);
  const _logger = getLogger("service.tags");

  const updateExpenseTags = async (expense: ExpenseFields) => {
    const logger = getLogger("updateExpenseTag", _logger);
    const expenseTags = expense.tags;
    logger.debug("expense tags size: ", expenseTags.length);
    const expenseItemTags = expense.expenseItems?.flatMap((ei) => ei.tags) || [];
    logger.debug("expense item tags size: ", expenseTags.length);
    const tags = [...expenseTags, ...expenseItemTags];
    const promises = tags.map(async (tag) => {
      const resource: TagResource = {
        value: tag,
        belongsTo: TagBelongsTo.Expenses,
      };
      await tagsDb.addUpdateItem(resource);
    });
    await Promise.all(promises);
    logger.debug("add update tags completed");
  };

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
    getCount,
    getTags,
    updateTags,
    updateExpenseTags,
  };
};
