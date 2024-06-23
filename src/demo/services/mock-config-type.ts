import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { auditData } from "./userDetails";
import { AxiosRequestConfig } from "axios";
import { ConfigResource, ConfigTypeBelongsTo, ConfigTypeStatus, getLogger } from "../../services";
import { CurrencyProfileResource } from "../../pages/settings/services";
import { addUpdateConfigTypes, deleteConfigType, getConfigTypes } from "../mock-db/config-type-db";

const MockConfigType = (demoMock: MockAdapter) => {
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

  const addUpdateConfigType = async (belongsTo: ConfigTypeBelongsTo, config: AxiosRequestConfig) => {
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

    const result = await addUpdateConfigTypes({ ...data, belongsTo: belongsTo });
    logger.log("result", result);
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  };

  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.ExpenseCategory).reply((config) => {
    return addUpdateConfigType(ConfigTypeBelongsTo.ExpenseCategory, config);
  });
  demoMock.onPost("/config/types/belongs-to/" + ConfigTypeBelongsTo.PaymentAccountType).reply((config) => {
    return addUpdateConfigType(ConfigTypeBelongsTo.PaymentAccountType, config);
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

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.ExpenseCategory).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.ExpenseCategory, config);
  });

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.PaymentAccountType).reply(async (config) => {
    return await getConfigTypeList(ConfigTypeBelongsTo.PaymentAccountType, config);
  });

  demoMock.onGet("/config/types/belongs-to/" + ConfigTypeBelongsTo.CurrencyProfile).reply((config) => {
    const logger = getLogger("mock.config-types." + ConfigTypeBelongsTo.CurrencyProfile + ".getList");
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    logger.debug("config", config, ", params =", config.params);
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

export default MockConfigType;
