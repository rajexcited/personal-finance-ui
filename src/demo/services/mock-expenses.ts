import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { ValidationErrorResource, missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { ExpenseFields } from "../../pages/expenses/services";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/expense-receipts-db";
import { ExpenseFilter, addUpdateExpense, deleteExpense, getExpenseDetails, getExpenses } from "../mock-db/expense-db";
import { LoggerBase, getLogger, subtractDates } from "../../services";
import { ExpenseStatus } from "../../pages/expenses/services/field-types";
import datetime from "date-and-time";

type ExpenseParam = Partial<Pick<Record<string, string[]>, "status" | "pageNo" | "pageMonths" | "purchasedYear">>;
const _rootLogger = getLogger("mock.api.expenses", null, null, "DEBUG");

const MockExpenses = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/expenses\/id\/.+/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const expenseId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ id: expenseId }, ["id"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await deleteExpense(expenseId);
    if (result.error) {
      return responseCreator.toNotFoundError("expense does not exist. cannot be deleted");
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/expenses").reply(async (config) => {
    const logger = getLogger("addUpdate", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const data = JSON.parse(config.data) as ExpenseFields;

    const missingErrors = missingValidation(data, ["id", "billName", "expenseItems", "purchasedDate", "receipts", "tags"]);
    const notUuidErrors = validateDataType(data, ["id", "expenseCategoryId", "paymentAccountId"], "uuid");
    const notStringErrors = validateDataType(data, ["billName", "amount", "description", "purchasedDate", "verifiedTimestamp"], "string");
    const notArrayErrors = validateDataType(data, ["expenseItems", "receipts", "tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    logger.info("validationErrors =", validationErrors);
    if (validationErrors.length > 0) {
      logger.info("found validation errors for data =", data);
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdateExpense(data);
    if (result.error) {
      return responseCreator.toUnknownError(result.error);
    }
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/expenses/tags").reply(async (config) => {
    const logger = getLogger("getTags", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const params = config.params as ExpenseParam;
    const missingErrors = missingValidation(params, ["purchasedYear"]);
    const dataTypeErrors = validateDataType(params, ["purchasedYear"], "arraynumber");

    logger.info("found validation errors for purchasedYear param =", [...missingErrors, ...dataTypeErrors]);

    if (missingErrors.length > 0) {
      return responseCreator.toValidationError(missingErrors);
    }
    if (dataTypeErrors.length > 0) {
      return responseCreator.toValidationError(dataTypeErrors);
    }

    const purchasedYearParams = [params.purchasedYear].flat().map((yr) => Number(yr));

    const thisYear = new Date().getFullYear();
    const yearGap = thisYear - [...purchasedYearParams].sort()[0];
    const resultPromises = [];
    for (let i = 0; i < yearGap; i++) {
      if (purchasedYearParams.includes(thisYear - i)) {
        const expenseParams: ExpenseFilter = {
          pageNo: i + 1,
          pageMonths: 12,
          status: [ExpenseStatus.Enable, ExpenseStatus.Deleted],
        };
        const promise = getExpenses(expenseParams);
        resultPromises.push(promise);
      }
    }
    const results = await Promise.all(resultPromises);
    const resultList = results.flatMap((r) => r.list);

    type PurchasedYearRange = Pick<Record<string, Date>, "startDate" | "endDate">;
    const purchasedYearRanges = purchasedYearParams.map((yr) => {
      const range: PurchasedYearRange = {
        startDate: datetime.parse("01-01-" + yr, "MM-DD-YYYY"),
        endDate: datetime.parse("12-31-" + yr, "MM-DD-YYYY"),
      };
      return range;
    });

    logger.debug("purchasedYearParams =", purchasedYearParams, ", purchasedYearRanges =", purchasedYearRanges);
    const responselist = resultList
      .filter((xp) => {
        return purchasedYearRanges.find((range) => {
          const beforeEndRange = subtractDates(range.endDate, xp.purchasedDate).toSeconds();
          const afterStartRange = subtractDates(xp.purchasedDate, range.startDate).toSeconds();
          logger.debug(
            "range =",
            range,
            ", xp.purchasedDate =",
            xp.purchasedDate,
            ", afterStartRange =",
            afterStartRange,
            ", beforeEndRange =",
            beforeEndRange
          );
          return afterStartRange >= 0 && beforeEndRange >= 0;
        });
      })
      .flatMap((xp) => xp.tags);

    return responseCreator.toSuccessResponse(responselist);
  });

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

  demoMock.onGet("/expenses/count").reply(async (config) => {
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

  demoMock.onGet("/expenses").reply(async (config) => {
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

  demoMock.onPost(/\/expenses\/id\/.+\/receipts\/id\/.+/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const filedata = config.data as File;

    const urlParts = config.url?.split("/") || [];
    const expenseId = urlParts.slice(3, 4)[0];
    const validationErrors = validateDataType({ expenseId: expenseId }, ["expenseId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }
    const receiptName = urlParts.slice(-1)[0];

    await saveReceiptFileData(filedata, expenseId, receiptName);

    return responseCreator.toSuccessResponse("saved");
  });

  demoMock.onGet(/\/expenses\/id\/.+\/receipts\/id\/.+/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const urlParts = config.url?.split("/") || [];
    const expenseId = urlParts.slice(3, 4)[0];
    const receiptId = urlParts.slice(-1)[0];

    const validationErrors = validateDataType({ expenseId: expenseId, receiptId: receiptId }, ["expenseId", "receiptId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getReceiptFileData(expenseId, receiptId);
    if (result.error) {
      responseCreator.toUnknownError(result.error);
    }

    return responseCreator.toSuccessResponse(result.data);
  });

  demoMock.onGet(/\/expenses\/id\/.+/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const expenseId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ id: expenseId }, ["id"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getExpenseDetails(expenseId);
    if (result.error) {
      return responseCreator.toNotFoundError("expense does not exist. cannot be retrieved");
    }

    return responseCreator.toSuccessResponse(result.getDetails);
  });
};

export default MockExpenses;
