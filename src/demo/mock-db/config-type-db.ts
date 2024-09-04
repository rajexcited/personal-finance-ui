import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, getLogger } from "../../shared";
import { auditData } from "../services/userDetails";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { v4 as uuidv4 } from "uuid";

const configTypeDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);

const randomStatus = () => {
  const statuses = [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

const initializePymtAccTypes = async () => {
  const pymtAccTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.PaymentAccountType);
  if (pymtAccTypes.length === 0) {
    const defaultAccTypes = ["checking", "savings", "credit card", "loan", "cash", "gift card"];

    const accTypes = defaultAccTypes.map(
      (type) =>
        ({
          belongsTo: ConfigTypeBelongsTo.PaymentAccountType,
          id: uuidv4(),
          name: type,
          value: type,
          status: randomStatus(),
          tags: [],
          description: type + " account type",
          auditDetails: auditData(),
        } as ConfigResource)
    );

    // making sure at least 1 enable
    accTypes[0].status = ConfigTypeStatus.Enable;
    // having only 1 with deleted status
    accTypes[accTypes.length - 1].status = ConfigTypeStatus.Deleted;
    const pymtAccTypePromises = accTypes.map(async (pymtAccType) => {
      await configTypeDb.addItem(pymtAccType);
    });
    await Promise.all(pymtAccTypePromises);
  }
};

const initializePurchaseTypes = async () => {
  const purchaseTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.BelongsTo, ConfigTypeBelongsTo.PurchaseType);
  if (purchaseTypes.length === 0) {
    const defaultPurchaseTypes = [
      "fee",
      "commute",
      "food shopping",
      "health",
      "home stuffs",
      // "investment",
      "maintenance",
      // "nri transfer",
      "hangout",
      "gift",
      "shopping",
    ];

    const purchaseTypes = defaultPurchaseTypes.map((ptype) => {
      return {
        belongsTo: ConfigTypeBelongsTo.PurchaseType,
        id: uuidv4(),
        name: ptype,
        value: ptype,
        status: randomStatus(),
        tags: [],
        description: "Purchase type is " + ptype + ". Used to tag purchase transactions.",
        auditDetails: auditData(),
      } as ConfigResource;
    });
    purchaseTypes[purchaseTypes.length - 1].status = ConfigTypeStatus.Deleted;

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
        status: randomStatus(),
        tags: [],
        description: "Refund Reason is " + rfdrsn + ". Used to tag refund transactions.",
        auditDetails: auditData(),
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
      "cd interest",
    ];

    const incomeTypeCfgList = defaultIncomeTypes.map((inctyp) => {
      return {
        belongsTo: ConfigTypeBelongsTo.IncomeType,
        id: uuidv4(),
        name: inctyp,
        value: inctyp,
        status: randomStatus(),
        tags: [],
        description: "Income Type is " + inctyp + ". Used to tag income transactions.",
        auditDetails: auditData(),
      } as ConfigResource;
    });
    incomeTypeCfgList[incomeTypeCfgList.length - 1].status = ConfigTypeStatus.Deleted;

    const incomeTypeCfgPromises = incomeTypeCfgList.map(async (incomeTypeCfg) => {
      await configTypeDb.addItem(incomeTypeCfg);
    });

    await Promise.all(incomeTypeCfgPromises);
  }
};

const init = async () => {
  await Promise.all([initializePurchaseTypes(), initializePymtAccTypes(), initializeRefundReasons(), initializeIncomeTypes()]);
};

await init();

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

export const getPaymentAccountTypes = async () => {
  return await getConfigTypes(ConfigTypeBelongsTo.PaymentAccountType);
};

export const getPurchaseTypes = async () => {
  return await getConfigTypes(ConfigTypeBelongsTo.PurchaseType);
};

export const getRefundReasons = async () => {
  return await getConfigTypes(ConfigTypeBelongsTo.RefundReason);
};

export const getIncomeTypes = async () => {
  return await getConfigTypes(ConfigTypeBelongsTo.IncomeType);
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
    };
    await configTypeDb.addUpdateItem(updatingConfigType);
    return { updated: updatingConfigType };
  }

  const addingConfigType: ConfigResource = {
    ...data,
    auditDetails: auditData(),
    status: ConfigTypeStatus.Enable,
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
      auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn),
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
      auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn),
    };
    await configTypeDb.addUpdateItem(updatingConfigTypeStatus);
    return { updated: { ...updatingConfigTypeStatus } };
  }
  return { error: "config not found" };
};
