import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateAuthorization, validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { auditData } from "./userDetails";
import { AxiosRequestConfig } from "axios";
import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus } from "../../services";
import { CurrencyProfileResource } from "../../pages/settings/services";

const belongsToAccType = "pymt-account-type";
const belongsToExpenseCategory = "expense-category";

const MockConfigType = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/config\/types\/belongs-to\/.+\/id\/.+/).reply((config) => {
    // const deleteConfigType = (belongsTo: string, config: AxiosRequestConfig) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const configId = (config.url as string)
      .replace("/config/types/belongs-to/" + belongsToExpenseCategory + "/id/", "")
      .replace("/config/types/belongs-to/" + belongsToAccType + "/id/", "");
    console.log("url", config.url, "configId", configId);
    const error = validateUuid(configId, "configId");
    if (error) {
      return responseCreator.toValidationError([error]);
    }
    const result = configSessionData.deleteConfigType(configId);
    console.log("delete result", result);
    if (result.error) {
      return responseCreator.toValidationError([{ path: "id", message: "config with given configId does not exist." }]);
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  const addUpdateConfigType = (belongsTo: string, config: AxiosRequestConfig) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const data = JSON.parse(config.data);
    let result: { added?: any; updated?: any };
    console.log("add update config", data);
    if ("id" in data) {
      // update
      const err = validateUuid(data.id, "id");
      if (err) {
        return responseCreator.toValidationError([err]);
      }

      result = configSessionData.addUpdateConfigTypes({ ...data, auditDetails: auditData(data.createdBy, data.createdOn) });
    } else {
      result = configSessionData.addUpdateConfigTypes({ ...data, id: uuidv4(), auditDetails: auditData() });
    }
    console.log("result", result);
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  };

  demoMock.onPost("/config/types/belongs-to/" + belongsToExpenseCategory).reply((config) => {
    return addUpdateConfigType(belongsToExpenseCategory, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + belongsToAccType).reply((config) => {
    return addUpdateConfigType(belongsToAccType, config);
  });

  const getConfigTypes = (belongsTo: string, config: AxiosRequestConfig) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = configSessionData.getConfigTypes(belongsTo);
    let responselist = result.list;
    if (config.params.status) {
      let invalidStatuses: string[] = [];
      if (!Array.isArray(config.params.status)) {
        invalidStatuses = config.params.status;
      } else {
        invalidStatuses = config.params.status.filter(
          (st: string) => ![ConfigTypeStatus.Enable, ConfigTypeStatus.Disable].includes(st as ConfigTypeStatus)
        );
      }
      if (invalidStatuses.length !== 0) {
        return responseCreator.toValidationError([{ path: "status", message: "status in param provided is not valid" }]);
      }

      responselist = responselist.filter((cfg: any) => config.params.status.includes(cfg.status));
    }

    return responseCreator.toSuccessResponse(responselist);
  };

  demoMock.onGet("/config/types/belongs-to/" + belongsToExpenseCategory).reply((config) => {
    return getConfigTypes(belongsToExpenseCategory, config);
  });

  demoMock.onGet("/config/types/belongs-to/" + belongsToAccType).reply((config) => {
    return getConfigTypes(belongsToAccType, config);
  });

  demoMock.onGet("/config/types/belongs-to/currency-profile").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const belongsTo = "currency-profile";

    const paramConfigStatus = Array.isArray(config.params.status) ? config.params.status : [config.params.status || ConfigTypeStatus.Enable];

    const invalidStatuses = paramConfigStatus.filter(
      (st: string) => ![ConfigTypeStatus.Enable, ConfigTypeStatus.Disable].includes(st as ConfigTypeStatus)
    );

    if (invalidStatuses.length !== 0) {
      return responseCreator.toValidationError([{ path: "status", message: "status in param provided is not valid" }]);
    }

    const mocklist: CurrencyProfileResource[] = [
      {
        id: uuidv4(),
        name: "USA",
        value: "USD",
        belongsTo: ConfigTypeBelongsTo.CurrencyProfile,
        status: ConfigTypeStatus.Enable,
        description: "currency profile for country, United States of America and currency, Dollar",
        tags: [],
        auditDetails: auditData(),
        country: {
          name: "United States of America",
          code: "USA",
        },
        currency: {
          name: "Dollar",
          code: "USD",
          symbol: "$",
        },
      },
    ];
    const responselist = mocklist.filter((cfg) => config.params.status.includes(cfg.status));

    return responseCreator.toSuccessResponse(responselist);
  });
};

function SessionData() {
  const configTypes: ConfigResource[] = [];

  const randomStatus = () => {
    const statuses = [ConfigTypeStatus.Enable, ConfigTypeStatus.Disable];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  };

  const init = () => {
    const defaultAccTypes = ["checking", "savings", "credit card", "loan", "cash", "gift card"];

    const accTypes = defaultAccTypes.map((type) => {
      return {
        belongsTo: belongsToAccType,
        id: uuidv4(),
        name: type,
        value: type,
        status: randomStatus(),
        tags: [],
        description: type + " account type",
        auditDetails: auditData(),
      } as ConfigResource;
    });
    // making sure at least 1 enable
    accTypes[0].status = ConfigTypeStatus.Enable;
    // having only 1 with deleted status
    accTypes[accTypes.length - 1].status = ConfigTypeStatus.Deleted;

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
        belongsTo: belongsToExpenseCategory,
        id: uuidv4(),
        name: category,
        value: category,
        status: randomStatus(),
        tags: [],
        description: "Expense category is " + category + ". Used to tag expense transactions.",
        auditDetails: auditData(),
      } as ConfigResource;
    });
    categories[categories.length - 1].status = ConfigTypeStatus.Deleted;

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
    const existingConfigTypeIndex = configTypes.findIndex((cfg: any) => cfg.configId === data.configId && data.belongsTo === cfg.belongsTo);
    if (existingConfigTypeIndex !== -1) {
      console.log("updating data", data);
      configTypes[existingConfigTypeIndex] = data;
      return { updated: data };
    }
    configTypes.push(data);
    return { added: data };
  };

  const deleteConfigType = (configId: string) => {
    const existingConfigTypeIndex = configTypes.findIndex((cfg) => cfg.id === configId);
    if (existingConfigTypeIndex !== -1) {
      const existingConfigType = configTypes[existingConfigTypeIndex];
      configTypes[existingConfigTypeIndex] = {
        ...existingConfigType,
        status: ConfigTypeStatus.Deleted,
        auditDetails: auditData(existingConfigType.auditDetails.createdBy, existingConfigType.auditDetails.createdOn as Date),
      };
      return { deleted: { ...configTypes[existingConfigTypeIndex] } };
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
