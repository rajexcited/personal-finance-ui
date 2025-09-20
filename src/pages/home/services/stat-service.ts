import { axios, handleRestErrors, getLogger, MyLocalDatabase, LocalDBStore, getCacheOption, LocalDBStoreIndex } from "../../../shared";
import pMemoize, { pMemoizeClear } from "p-memoize";
import { StatBelongsTo, StatsExpenseResource } from "./field-types";
import { v4 as uuidv4 } from "uuid";

const statsDb = new MyLocalDatabase<StatsExpenseResource>(LocalDBStore.Statistics);

const rootPath = "/stats";
const _logger = getLogger("service.home.stats", null, null, "DISABLED");

export const clearStatsCache = async (belongsTo: StatBelongsTo, years?: number | number[]) => {
  if (belongsTo === StatBelongsTo.PurchaseMinusRefund) {
    // do nothing
    return;
  }
  if (belongsTo === StatBelongsTo.Purchase) {
    pMemoizeClear(getPurchaseStats);
  } else if (belongsTo === StatBelongsTo.Refund) {
    pMemoizeClear(getRefundStats);
  } else if (belongsTo === StatBelongsTo.Income) {
    pMemoizeClear(getIncomeStats);
  }

  if (years === undefined) {
    await statsDb.clearAll();
    return;
  }
  const statsYears = Array.isArray(years) ? years : [years];
  const statsDetailsPromiseList = statsYears.map((year) => statsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, [belongsTo, year.toString()]));
  const statDetailsList = await Promise.all(statsDetailsPromiseList);
  const statDeletePromises = statDetailsList.flat().map((statDetails) => statsDb.delete(statDetails.id));
  await Promise.all(statDeletePromises);
};

export const getRefundStats = pMemoize(async (year: string) => {
  const logger = getLogger("getRefundStats", _logger);

  try {
    const dbRefundStats = await statsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, [StatBelongsTo.Refund, year]);
    logger.debug("dbRefundStats =", dbRefundStats);
    if (dbRefundStats.length === 1) {
      return dbRefundStats[0];
    }

    const response = await axios.get(`${rootPath}/refund`, { params: { year: [year] } });
    logger.debug("response.data =", response.data);
    const refundStats: StatsExpenseResource = { ...response.data, id: uuidv4(), year: String(response.data.year) };
    statsDb.addUpdateItem(refundStats);
    return refundStats;
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("30 sec"));

export const getPurchaseStats = pMemoize(async (year: string) => {
  const logger = getLogger("getPurchaseStats", _logger);

  try {
    const dbPurchaseStats = await statsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, [StatBelongsTo.Purchase, year]);
    logger.debug("dbPurchaseStats =", dbPurchaseStats);
    if (dbPurchaseStats.length === 1) {
      return dbPurchaseStats[0];
    }

    const response = await axios.get(`${rootPath}/purchase`, { params: { year: [year] } });
    logger.debug("response.data =", response.data);

    const purchseStats: StatsExpenseResource = { ...response.data, id: uuidv4(), year: String(response.data.year) };
    statsDb.addUpdateItem(purchseStats);
    return purchseStats;
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("30 sec"));

export const getIncomeStats = pMemoize(async (year: string) => {
  const logger = getLogger("getIncomeStats", _logger);

  try {
    const dbIncomeStats = await statsDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, [StatBelongsTo.Income, year]);
    logger.debug("dbIncomeStats =", dbIncomeStats);
    if (dbIncomeStats.length === 1) {
      return dbIncomeStats[0];
    }

    const response = await axios.get(`${rootPath}/income`, { params: { year: [year] } });
    logger.debug("response.data =", response.data);

    const incomeStats: StatsExpenseResource = { ...response.data, id: uuidv4(), year: String(response.data.year) };
    statsDb.addUpdateItem(incomeStats);
    return incomeStats;
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("30 sec"));
