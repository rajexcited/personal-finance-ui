import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { AxiosRequestConfig } from "axios";
import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, getLogger } from "../../shared";
import { addUpdateConfigType, deleteConfigType, getConfigTypeDetails, getConfigTypes, updateConfigTypeStatus } from "../mock-db/config-type-db";

export const MockConfigType = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/config\/types\/belongs-to\/.+\/id\/.+/).reply(async (config) => {
    const logger = getLogger("mock.config-type.delete");

    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const url = config.url as string;
    const configId = url.split("/").slice(-1)[0];

    logger.log("url", config.url, "configId", configId);
    const validationErrors = validateDataType({ configId }, ["configId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }
    const result = await deleteConfigType(configId);
    logger.log("delete result", result);
    if (result.error) {
      return responseCreator.toNotFoundError(result.error);
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onGet(/\/config\/types\/belongs-to\/.+\/id\/.+/).reply(async (config) => {
    const logger = getLogger("mock.config-type.getDetails");

    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const urlParts = (config.url as string).split("/");
    const configId = urlParts.slice(-1)[0];
    const belongsTo = urlParts.slice(4, 5)[0];

    logger.log("url =", config.url, ", configId =", configId, ", belongsTo =", belongsTo);
    const validationErrors = validateDataType({ configId }, ["configId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }
    const result = await getConfigTypeDetails(belongsTo, configId);
    logger.log("get result", result);
    if (result.error) {
      return responseCreator.toNotFoundError(result.error);
    }

    return responseCreator.toSuccessResponse(result.get);
  });

  demoMock.onPost(/\/config\/types\/belongs-to\/.+\/id\/.+\/status\/.+/).reply(async (config) => {
    const logger = getLogger("mock.config-type.updateStatus");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const urlParts = (config.url as string).split("/");
    const configStatus = urlParts.slice(-1)[0];
    const configId = urlParts.slice(6, 7)[0];
    const belongsTo = urlParts.slice(4, 5)[0];

    logger.log("url =", config.url, ", configId =", configId, ", belongsTo =", belongsTo, ", status =", configStatus);
    const validationErrors = validateDataType({ configId }, ["configId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }
    if (configStatus !== ConfigTypeStatus.Enable && configStatus !== ConfigTypeStatus.Disable) {
      return responseCreator.toNotFoundError("invalid status update url");
    }
    if (
      belongsTo !== ConfigTypeBelongsTo.PurchaseType &&
      belongsTo !== ConfigTypeBelongsTo.PaymentAccountType &&
      belongsTo !== ConfigTypeBelongsTo.IncomeType &&
      belongsTo !== ConfigTypeBelongsTo.RefundReason &&
      belongsTo !== ConfigTypeBelongsTo.SharePerson
    ) {
      return responseCreator.toNotFoundError("invalid belongsTo update url");
    }

    const result = await updateConfigTypeStatus(configId, belongsTo, configStatus);
    logger.log("db update result", result);
    if (result.error) {
      return responseCreator.toNotFoundError(result.error);
    }

    return responseCreator.toSuccessResponse(result.updated);
  });

  const addUpdate = async (belongsTo: ConfigTypeBelongsTo, config: AxiosRequestConfig) => {
    const logger = getLogger("mock.config-type.addUpdate");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const data = JSON.parse(config.data) as ConfigResource;
    logger.log("add update config", data);

    const missingErrors = missingValidation(data, ["id", "name", "value", "tags"]);
    const notUuidErrors = validateDataType(data, ["id"], "uuid");
    const notStringErrors = validateDataType(data, ["description", "belongsTo", "status"], "string");
    const notArrayErrors = validateDataType(data, ["tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdateConfigType({ ...data, belongsTo: belongsTo });
    logger.log("result", result);
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  };

  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.PurchaseType).reply((config) => {
    return addUpdate(ConfigTypeBelongsTo.PurchaseType, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.RefundReason).reply((config) => {
    return addUpdate(ConfigTypeBelongsTo.RefundReason, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.IncomeType).reply((config) => {
    return addUpdate(ConfigTypeBelongsTo.IncomeType, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.PaymentAccountType).reply((config) => {
    return addUpdate(ConfigTypeBelongsTo.PaymentAccountType, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.SharePerson).reply((config) => {
    return addUpdate(ConfigTypeBelongsTo.SharePerson, config);
  });

  const getConfigTypeList = async (belongsTo: string, config: AxiosRequestConfig) => {
    const logger = getLogger("mock.config-types." + belongsTo + ".getList");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = await getConfigTypes(belongsTo);
    let responselist = result.list;
    logger.debug("config", config, ", params =", config.params);
    if (config.params.status) {
      let invalidStatuses: string[] = [];
      if (!Array.isArray(config.params.status)) {
        invalidStatuses = config.params.status;
      } else {
        invalidStatuses = config.params.status.filter((st: string) => ![ConfigTypeStatus.Enable, ConfigTypeStatus.Disable].includes(st as ConfigTypeStatus));
      }
      if (invalidStatuses.length !== 0) {
        return responseCreator.toValidationError([{ path: "status", message: "status in param provided is not valid" }]);
      }

      responselist = responselist.filter((cfg: any) => config.params.status.includes(cfg.status));
    }

    return responseCreator.toSuccessResponse(responselist);
  };

  const getConfigTypeTags = async (belongsTo: ConfigTypeBelongsTo, config: AxiosRequestConfig) => {
    const logger = getLogger("mock.config-types." + belongsTo + ".getTags");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = await getConfigTypes(belongsTo);
    const responselist = result.list.flatMap((ec) => ec.tags);

    logger.debug("categories size=", result.list.length, ", tags size =", responselist.length);
    return responseCreator.toSuccessResponse(responselist);
  };

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.PurchaseType + "/tags").reply(async (config) => {
    return getConfigTypeTags(ConfigTypeBelongsTo.PurchaseType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.RefundReason + "/tags").reply(async (config) => {
    return getConfigTypeTags(ConfigTypeBelongsTo.RefundReason, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.IncomeType + "/tags").reply(async (config) => {
    return getConfigTypeTags(ConfigTypeBelongsTo.IncomeType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.PaymentAccountType + "/tags").reply(async (config) => {
    return getConfigTypeTags(ConfigTypeBelongsTo.PaymentAccountType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.SharePerson + "/tags").reply(async (config) => {
    return getConfigTypeTags(ConfigTypeBelongsTo.SharePerson, config);
  });

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.PurchaseType).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.PurchaseType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.RefundReason).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.RefundReason, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.IncomeType).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.IncomeType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.PaymentAccountType).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.PaymentAccountType, config);
  });
  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.SharePerson).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.SharePerson, config);
  });

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.CurrencyProfile).reply(async (config) => {
    const logger = getLogger("mock.config-types." + ConfigTypeBelongsTo.CurrencyProfile + ".getList");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    logger.debug("config", config, ", params =", config.params);

    const paramConfigStatus = Array.isArray(config.params.status) ? config.params.status : [config.params.status || ConfigTypeStatus.Enable];

    const invalidStatuses = paramConfigStatus.filter((st: string) => ![ConfigTypeStatus.Enable, ConfigTypeStatus.Disable].includes(st as ConfigTypeStatus));

    if (invalidStatuses.length !== 0) {
      return responseCreator.toValidationError([{ path: "status", message: "status in param provided is not valid" }]);
    }

    const result = await getConfigTypes(ConfigTypeBelongsTo.CurrencyProfile);
    const responselist = result.list
      .filter((cfg) => config.params.status.includes(cfg.status))
      .map((conf) => ({
        ...conf,
        country: {
          name: "United States of America",
          code: conf.name
        },
        currency: {
          name: "Dollar",
          code: conf.value,
          symbol: "$"
        }
      }));

    return responseCreator.toSuccessResponse(responselist);
  });
};
