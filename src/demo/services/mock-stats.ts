import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateAuthorization, validateDataType } from "./common-validators";
import { LoggerBase, getLogger } from "../../shared";
import { StatBelongsTo } from "../../pages/home/services";
import { AxiosRequestConfig } from "axios";
import { getExpenseStats } from "../mock-db/xpns-stats-db";

type StatsParam = Record<"year", string[]>;

const rootLogger = getLogger("mock.api.stats", null, null, "DISABLED");
const rootPath = "/stats";

export const MockStats = (demoMock: MockAdapter) => {
  const getValidatedParams = (params: StatsParam, baseLogger: LoggerBase) => {
    const logger = getLogger("getValidatedParams", baseLogger);

    const yearErrors = validateDataType(params, ["year"], "arraynumber");
    logger.debug("found validation errors for year param =", [...yearErrors]);
    if (yearErrors.length > 0) {
      return { errors: yearErrors };
    }
    const convertedParams = {
      year: Number(params.year[0])
    };
    logger.debug("convertedParams =", convertedParams);
    return {
      params: convertedParams
    };
  };

  const getStats = async (config: AxiosRequestConfig, belongsTo: StatBelongsTo, logger: LoggerBase) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    logger.debug("config.params =", config.params, config);
    const paramResult = getValidatedParams(config.params, logger);
    if (paramResult.errors) {
      return responseCreator.toValidationError(paramResult.errors);
    }

    const result = await getExpenseStats(belongsTo, paramResult.params.year);
    return responseCreator.toSuccessResponse(result.stats);
  };

  demoMock.onGet(rootPath + "/purchase").reply(async (config) => {
    const logger = getLogger("getPurchaseStats", rootLogger);
    return getStats(config, StatBelongsTo.Purchase, logger);
  });

  demoMock.onGet(rootPath + "/refund").reply(async (config) => {
    const logger = getLogger("getRefundStats", rootLogger);
    return getStats(config, StatBelongsTo.Refund, logger);
  });

  demoMock.onGet(rootPath + "/income").reply(async (config) => {
    const logger = getLogger("getIncomeStats", rootLogger);
    return getStats(config, StatBelongsTo.Income, logger);
  });
};
