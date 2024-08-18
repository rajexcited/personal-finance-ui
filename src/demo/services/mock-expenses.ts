import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { ValidationErrorResource, missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { ExpenseFilter, getExpenses } from "../mock-db/expense-db";
import { LoggerBase, getLogger } from "../../shared";
import { ExpenseStatus } from "../../pages/expenses/services/field-types";

type ExpenseParam = Partial<Pick<Record<string, string[]>, "status" | "pageNo" | "pageMonths" | "purchasedYear">>;
const _rootLogger = getLogger("mock.api.expenses", null, null, "DEBUG");
const rootPath = "/expenses";

export const MockExpenses = (demoMock: MockAdapter) => {
  const getValidatedConfigParams = (params: ExpenseParam, baseLogger: LoggerBase) => {
    const logger = getLogger("getValidatedConfigParams", baseLogger);

    const missingErrors = missingValidation(params, ["pageNo"]);
    logger.debug("found missing errors for pageNo param =", [...missingErrors]);
    if (missingErrors.length > 0) {
      return { errors: missingErrors };
    }
    const pageNoErrors = validateDataType(params, ["pageNo"], "arraynumber");
    logger.debug("found validation errors for pageNo param =", [...pageNoErrors]);
    if (pageNoErrors.length > 0) {
      return { errors: pageNoErrors };
    }

    const statusParams = params?.status ? [params.status].flat().filter((st) => st) : [];
    const invalidStatus = statusParams.find((st) => ExpenseStatus.Enable !== st && ExpenseStatus.Deleted !== st);
    logger.debug("found invalid status param =", invalidStatus);
    if (invalidStatus) {
      const validationError: ValidationErrorResource<ExpenseParam> = { path: "status", message: "incorrect format" };
      return { errors: [validationError] };
    }

    const pageMonthsErrors = validateDataType(params, ["pageMonths"], "arraynumber");
    logger.debug("found validation errors for pageMonths param =", [...pageMonthsErrors]);

    if (pageMonthsErrors.length > 0) {
      return { errors: pageMonthsErrors };
    }

    const pageNo = params.pageNo ? params.pageNo[0] : "1";
    const convertedParams: ExpenseFilter = {
      pageNo: Number(pageNo),
      status: statusParams.length > 0 ? (statusParams as ExpenseStatus[]) : undefined,
      pageMonths: params.pageMonths ? Number(params.pageMonths[0]) : undefined,
    };
    logger.debug("convertedParams =", convertedParams);
    return {
      params: convertedParams,
    };
  };

  demoMock.onGet(rootPath + "/count").reply(async (config) => {
    const logger = getLogger("getCount", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    logger.debug("config.params =", config.params, config);
    const paramResult = getValidatedConfigParams(config.params, logger);
    if (paramResult.errors) {
      return responseCreator.toValidationError(paramResult.errors);
    }
    const result = await getExpenses(paramResult.params);

    return responseCreator.toSuccessResponse(result.list.length);
  });

  demoMock.onGet(rootPath).reply(async (config) => {
    const logger = getLogger("getList", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const paramResult = getValidatedConfigParams(config.params, logger);
    if (paramResult.errors) {
      return responseCreator.toValidationError(paramResult.errors);
    }
    const result = await getExpenses(paramResult.params);

    return responseCreator.toSuccessResponse(result.list);
  });
};
