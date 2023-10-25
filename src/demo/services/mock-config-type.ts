import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { auditData } from "./userDetails";

const belongsToAccType = "pymt-account-type";
const belongsToExpenseCategory = "expense-category";

const MockConfigType = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/config\/types\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const configId = (config.url || "").replace("/config/types/", "");
    const error = validateUuid(configId, "configId");
    if (error) {
      return responseCreator.toValidationError(error);
    }
    const result = configSessionData.deleteConfigType(configId);
    if (result.error) {
      return responseCreator.toValidationError([
        { loc: ["configId"], msg: "config with given configId does not exist." },
      ]);
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/config/types/").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    let result: { added?: any; updated?: any };
    if ("configId" in data) {
      // update
      const err = validateUuid(data.configId, "configId");
      if (err) {
        return responseCreator.toValidationError(err);
      }

      result = configSessionData.addUpdateConfigTypes({ ...data, ...auditData(data.createdBy, data.createdOn) });
    } else {
      result = configSessionData.addUpdateConfigTypes({ ...data, configId: uuidv4(), ...auditData() });
    }

    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/config/types").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const result = configSessionData.getConfigTypes(config.params.belongsTo);
    let responselist = result.list;
    if (config.params.status) {
      let invalidStatuses: string[] = [];
      if (!Array.isArray(config.params.status)) {
        invalidStatuses = config.params.status;
      } else {
        invalidStatuses = config.params.status.filter((st: string) => !["enable", "disable"].includes(st));
      }
      if (invalidStatuses.length !== 0) {
        return responseCreator.toValidationError([{ loc: ["status"], msg: "status in param provided is not valid" }]);
      }

      responselist = responselist.filter((cfg: any) => config.params.status.includes(cfg.status));
    }

    return responseCreator.toCreateResponse(responselist);
  });
};

function SessionData() {
  const configTypes: any[] = [];

  const randomStatus = () => {
    const statuses = ["enable", "disable", "deleted"];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  };

  const init = () => {
    const defaultAccTypes = ["checking", "savings", "credit card", "loan", "cash", "gift card"];

    const accTypes = defaultAccTypes.map((type) => ({
      belongsTo: belongsToAccType,
      configId: uuidv4(),
      name: type,
      status: randomStatus(),
      value: type,
      description: type + " account type",
      ...auditData(),
    }));
    accTypes[0].status = "enable";

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

    const categories = defaultCategories.map((category) => ({
      belongsTo: belongsToExpenseCategory,
      configId: uuidv4(),
      name: category,
      status: randomStatus(),
      value: category,
      description: "Expense category is " + category + ". Used to tag expense transactions.",
      ...auditData(),
    }));

    configTypes.push(...accTypes, ...categories);
  };

  const getConfigTypes = (belongsTo: string) => {
    return { list: configTypes.filter((cfg) => cfg.belongsTo === belongsTo) };
  };

  const getPaymentAccountTypes = () => {
    return getConfigTypes(belongsToAccType);
  };

  const getExpenseCategories = () => {
    return getConfigTypes(belongsToExpenseCategory);
  };

  const addUpdateConfigTypes = (data: any) => {
    const existingConfigTypeIndex = configTypes.findIndex(
      (cfg: any) => cfg.configId === data.configId && data.belongsTo === cfg.belongsTo
    );
    if (existingConfigTypeIndex !== -1) {
      configTypes[existingConfigTypeIndex] = data;
      return { updated: data };
    }
    configTypes.push(data);
    return { added: data };
  };

  const deleteConfigType = (configId: string) => {
    const existingConfigType = configTypes.find((cfg: any) => cfg.configId === configId);
    if (existingConfigType) {
      const newCfgs = [...configTypes];
      configTypes.length = 0;
      newCfgs.filter((cfg) => cfg.configId !== configId).forEach((cfg) => configTypes.push(cfg));
      return { deleted: existingConfigType };
    }
    return { error: "config not found" };
  };

  init();
  return {
    getConfigTypes,
    addUpdateConfigTypes,
    deleteConfigType,
    getPaymentAccountTypes,
    getExpenseCategories,
  };
}

export const configSessionData = SessionData();

export default MockConfigType;
