import ms from "ms";
import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, getLogger } from "../../shared";
import { auditData } from "../services/userDetails";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { v4 as uuidv4 } from "uuid";

const configTypeDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);
const rootLogger = getLogger("mock.db.configtype", null, null, "DISABLED");

const randomStatus = (statusList: Array<ConfigTypeStatus>) => {
  const randomIndex = Math.floor(Math.random() * statusList.length);
  return statusList[randomIndex];
};

const randomNotDeletedStatus = () => {
  return randomStatus([ConfigTypeStatus.Enable, ConfigTypeStatus.Disable]);
};

const initializePymtAccTypes = async () => {
  const pymtAccTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.PaymentAccountType);
  if (pymtAccTypes.length === 0) {
    const defaultEnabledAccTypes = ["checking", "savings", "credit card", "loan", "cash", "gift card"];
    const defaultNotEnabledAccTypes = ["investment", "wallet", "prepaid", "rewards", "escrow"];

    const accTypes = defaultEnabledAccTypes.map(
      (type) =>
        ({
          belongsTo: ConfigTypeBelongsTo.PaymentAccountType,
          id: uuidv4(),
          name: type,
          value: type,
          status: ConfigTypeStatus.Enable,
          tags: [],
          description: type + " account type",
          auditDetails: auditData()
        } as ConfigResource)
    );

    defaultNotEnabledAccTypes.forEach((type) => {
      accTypes.push({
        belongsTo: ConfigTypeBelongsTo.PaymentAccountType,
        id: uuidv4(),
        name: type,
        value: type,
        status: randomStatus([ConfigTypeStatus.Enable, ConfigTypeStatus.Disable, ConfigTypeStatus.Deleted]),
        tags: [],
        description: type + " account type",
        auditDetails: auditData()
      });
    });

    const pymtAccTypePromises = accTypes.map(async (pymtAccType) => {
      await configTypeDb.addItem(pymtAccType);
    });
    await Promise.all(pymtAccTypePromises);
  }
};

const initializePurchaseTypes = async () => {
  const purchaseTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.PurchaseType);
  if (purchaseTypes.length === 0) {
    const defaultEnabledPurchaseTypes = [
      "fee",
      "commute",
      "food shopping",
      "health",
      "home stuffs",
      "investment",
      "maintenance",
      "hangout",
      "gift",
      "shopping"
    ];
    const defaultNotEnabledPurchaseTypes = [
      "subscription",
      "education",
      "utilities",
      "insurance",
      "pet care",
      "travel",
      "charity",
      "entertainment",
      "electronics",
      "personal care"
    ];

    const purchaseTypes: Array<ConfigResource> = [];
    defaultEnabledPurchaseTypes.forEach((ptype) => {
      purchaseTypes.push({
        belongsTo: ConfigTypeBelongsTo.PurchaseType,
        id: uuidv4(),
        name: ptype,
        value: ptype,
        status: ConfigTypeStatus.Enable,
        tags: [],
        description: "Purchase type is " + ptype + ". Used to tag purchase transactions.",
        auditDetails: auditData()
      });
    });
    defaultNotEnabledPurchaseTypes.forEach((ptype) => {
      purchaseTypes.push({
        belongsTo: ConfigTypeBelongsTo.PurchaseType,
        id: uuidv4(),
        name: ptype,
        value: ptype,
        status: randomStatus([ConfigTypeStatus.Enable, ConfigTypeStatus.Disable, ConfigTypeStatus.Deleted]),
        tags: [],
        description: "Purchase type is " + ptype + ". Used to tag purchase transactions.",
        auditDetails: auditData()
      });
    });

    const purchaseTypePromises = purchaseTypes.map(async (purchaseType) => {
      await configTypeDb.addItem(purchaseType);
    });

    await Promise.all(purchaseTypePromises);
  }
};

const initializeRefundReasons = async () => {
  const refundReasons = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.RefundReason);
  if (refundReasons.length === 0) {
    const defaultRefundReasons = ["price match", "costly", "no deal", "found better deal", "wanted to try", "dont like", "broken"];

    const refundReasons = defaultRefundReasons.map((rfdrsn) => {
      return {
        belongsTo: ConfigTypeBelongsTo.RefundReason,
        id: uuidv4(),
        name: rfdrsn,
        value: rfdrsn,
        status: randomNotDeletedStatus(),
        tags: [],
        description: "Refund Reason is " + rfdrsn + ". Used to tag refund transactions.",
        auditDetails: auditData()
      } as ConfigResource;
    });
    refundReasons[refundReasons.length - 1].status = ConfigTypeStatus.Deleted;

    const refundReasonPromises = refundReasons.map(async (refundReason) => {
      await configTypeDb.addItem(refundReason);
    });

    await Promise.all(refundReasonPromises);
  }
};

const initializeIncomeTypes = async () => {
  const incomeTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.IncomeType);
  if (incomeTypes.length === 0) {
    const defaultIncomeTypes = [
      "salary",
      "passive income",
      "interest from savings",
      "gift",
      "credit card points",
      "divident",
      "stock profit/loss",
      "cd interest"
    ];

    const incomeTypeCfgList = defaultIncomeTypes.map((inctyp) => {
      return {
        belongsTo: ConfigTypeBelongsTo.IncomeType,
        id: uuidv4(),
        name: inctyp,
        value: inctyp,
        status: randomNotDeletedStatus(),
        tags: [],
        description: "Income Type is " + inctyp + ". Used to tag income transactions.",
        auditDetails: auditData()
      } as ConfigResource;
    });
    incomeTypeCfgList[incomeTypeCfgList.length - 1].status = ConfigTypeStatus.Deleted;

    const incomeTypeCfgPromises = incomeTypeCfgList.map(async (incomeTypeCfg) => {
      await configTypeDb.addItem(incomeTypeCfg);
    });

    await Promise.all(incomeTypeCfgPromises);
  }
};

const initializeCurrencyProfile = async () => {
  const currencyProfiles = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.CurrencyProfile);
  if (currencyProfiles.length === 0) {
    const defaultCurrencyProfile: ConfigResource = {
      belongsTo: ConfigTypeBelongsTo.CurrencyProfile,
      id: uuidv4(),
      name: "USA",
      value: "USD",
      status: ConfigTypeStatus.Enable,
      tags: [],
      description: "currency profile for country, United States of America and currency, Dollar",
      auditDetails: auditData()
    };

    await configTypeDb.addItem(defaultCurrencyProfile);
  }
};

export const initializeConfigTypeDb = async () => {
  await Promise.all([initializePurchaseTypes(), initializePymtAccTypes(), initializeRefundReasons(), initializeIncomeTypes(), initializeCurrencyProfile()]);
};

export const clearConfigTypeDb = async () => {
  const _logger = getLogger("clearConfigTypeDb", rootLogger);
  await configTypeDb.clearAll();
};

await initializeConfigTypeDb();

export const getConfigTypes = async (belongsTo: string) => {
  const allconfigs = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, belongsTo);
  return { list: allconfigs };
};

export const getConfigTypeDetails = async (belongsTo: string, configId: string) => {
  const configItem = await configTypeDb.getItem(configId);
  if (configItem?.belongsTo !== belongsTo) {
    return { error: "config not found" };
  }
  return { get: configItem };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getConfigTypesWithRetry = async (belongsTo: string) => {
  let retryCount = 3;
  let result;
  do {
    result = await getConfigTypes(belongsTo);
    if (result.list.length === 0) {
      await sleep(ms("1 sec"));
      retryCount--;
    } else {
      retryCount = 0;
    }
  } while (retryCount > 0);

  return result;
};

export const getPaymentAccountTypes = async () => {
  return await getConfigTypesWithRetry(ConfigTypeBelongsTo.PaymentAccountType);
};

export const getPurchaseTypes = async () => {
  const logger = getLogger("getPurchaseTypes", rootLogger);
  logger.log("retrieving purchase types from mock db");
  const results = await getConfigTypesWithRetry(ConfigTypeBelongsTo.PurchaseType);
  logger.debug("found", results.list.length, "purchase types. list=", results.list);
  return results;
};

export const getRefundReasons = async () => {
  return await getConfigTypesWithRetry(ConfigTypeBelongsTo.RefundReason);
};

export const getIncomeTypes = async () => {
  return await getConfigTypesWithRetry(ConfigTypeBelongsTo.IncomeType);
};

export const getDefaultCurrencyProfileId = async () => {
  const configResults = await getConfigTypesWithRetry(ConfigTypeBelongsTo.CurrencyProfile);
  return configResults.list[0].id;
};

export const addUpdateConfigType = async (data: ConfigResource) => {
  const logger = getLogger("mock.db.config-type.addUpdate");

  const existingConfigType = await configTypeDb.getItem(data.id);
  if (existingConfigType && existingConfigType.belongsTo === data.belongsTo) {
    logger.log("updating data", data);
    const updatingConfigType: ConfigResource = {
      ...data,
      auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn),
      status: ConfigTypeStatus.Enable,
      tags: data.tags.map((tg) => tg.replace(" ", "-"))
    };
    await configTypeDb.addUpdateItem(updatingConfigType);
    return { updated: updatingConfigType };
  }

  const addingConfigType: ConfigResource = {
    ...data,
    auditDetails: auditData(),
    status: ConfigTypeStatus.Enable,
    tags: data.tags.map((tg) => tg.replace(" ", "-"))
  };
  await configTypeDb.addUpdateItem(addingConfigType);

  return { added: addingConfigType };
};

export const deleteConfigType = async (configId: string) => {
  const existingConfigType = await configTypeDb.getItem(configId);
  if (existingConfigType) {
    const deletingConfigType: ConfigResource = {
      ...existingConfigType,
      status: ConfigTypeStatus.Deleted,
      auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn)
    };
    await configTypeDb.addUpdateItem(deletingConfigType);
    return { deleted: { ...deletingConfigType } };
  }
  return { error: "config not found" };
};

export const updateConfigTypeStatus = async (configId: string, belongsTo: ConfigTypeBelongsTo, status: ConfigTypeStatus) => {
  const existingConfigType = await configTypeDb.getItem(configId);
  if (existingConfigType && existingConfigType.belongsTo === belongsTo && existingConfigType.status !== status) {
    const updatingConfigTypeStatus: ConfigResource = {
      ...existingConfigType,
      status: status,
      auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn)
    };
    await configTypeDb.addUpdateItem(updatingConfigTypeStatus);
    return { updated: { ...updatingConfigTypeStatus } };
  }
  return { error: "config not found" };
};
