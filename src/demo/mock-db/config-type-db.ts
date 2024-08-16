import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, getLogger } from "../../services";
import { auditData } from "../services/userDetails";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { v4 as uuidv4 } from "uuid";

const configTypeDb = new MyLocalDatabase<ConfigResource>(LocalDBStore.Config);

const init = async () => {
  const randomStatus = () => {
    const statuses = [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  };

  const pymtAccTypes = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.ConfigBelongsTo, ConfigTypeBelongsTo.PaymentAccountType);
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

  const expenseCategories = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.ConfigBelongsTo, ConfigTypeBelongsTo.PurchaseType);
  if (expenseCategories.length === 0) {
    const defaultCategories = [
      "fee",
      "commute",
      "food shopping",
      "health",
      "home stuffs",
      "investment",
      "maintenance",
      "nri transfer",
      "hangout",
      "gift",
      "shopping",
    ];

    const categories = defaultCategories.map((category) => {
      return {
        belongsTo: ConfigTypeBelongsTo.PurchaseType,
        id: uuidv4(),
        name: category,
        value: category,
        status: randomStatus(),
        tags: [],
        description: "Purchase type is " + category + ". Used to tag expense transactions.",
        auditDetails: auditData(),
      } as ConfigResource;
    });
    categories[categories.length - 1].status = ConfigTypeStatus.Deleted;

    const categoryPromises = categories.map(async (expenseCategory) => {
      await configTypeDb.addItem(expenseCategory);
    });
    await Promise.all(categoryPromises);
  }
};

await init();

export const getConfigTypes = async (belongsTo: string) => {
  const allconfigs = await configTypeDb.getAllFromIndex(LocalDBStoreIndex.ConfigBelongsTo, belongsTo);
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

export const getExpenseCategories = async () => {
  return await getConfigTypes(ConfigTypeBelongsTo.PurchaseType);
};

export const addUpdateConfigTypes = async (data: ConfigResource) => {
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
