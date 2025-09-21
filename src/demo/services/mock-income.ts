import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/receipts-db";
import { getLogger } from "../../shared";
import { ExpenseBelongsTo, IncomeFields } from "../../pages/expenses/services";
import { addUpdateIncome, deleteIncome, getIncomeDetails, getIncomeTags } from "../mock-db/income-db";

type IncomeParam = Partial<Record<"status" | "pageNo" | "pageMonths" | "year", string[]>>;
const rootLogger = getLogger("mock.api.expenses.income", null, null, "DISABLED");
const rootPath = "/expenses/income";

export const MockIncome = (demoMock: MockAdapter) => {
  demoMock.onDelete(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const incomeId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ incomeId: incomeId }, ["incomeId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await deleteIncome(incomeId);
    if (result.error) {
      return responseCreator.toNotFoundError("income does not exist. cannot be deleted");
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost(rootPath).reply(async (config) => {
    const logger = getLogger("addUpdate", rootLogger);
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const data = JSON.parse(config.data) as IncomeFields;

    const missingErrors = missingValidation(data, ["id", "billName", "incomeDate", "tags", "description", "receipts", "incomeTypeId"]);
    const notUuidErrors = validateDataType(data, ["id", "incomeTypeId", "paymentAccountId"], "uuid");
    const notStringErrors = validateDataType(data, ["billName", "amount", "description", "incomeDate"], "string");
    const notArrayErrors = validateDataType(data, ["receipts", "tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    logger.info("validationErrors =", validationErrors);
    if (validationErrors.length > 0) {
      logger.info("found validation errors for data =", data);
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdateIncome({ ...data, belongsTo: ExpenseBelongsTo.Income });
    if (result.error) {
      return responseCreator.toUnknownError(result.error);
    }
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet(rootPath + "/tags").reply(async (config) => {
    const logger = getLogger("getTags", rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const params = config.params as IncomeParam;
    const missingErrors = missingValidation(params, ["year"]);

    logger.info("found missingErrors for year param =", [...missingErrors]);
    if (missingErrors.length > 0) {
      return responseCreator.toValidationError(missingErrors);
    }

    const dataTypeErrors = validateDataType(params, ["year"], "arraynumber");
    logger.info("found dataType arraynumber Errors for year param =", [...dataTypeErrors]);
    if (dataTypeErrors.length > 0) {
      return responseCreator.toValidationError(dataTypeErrors);
    }

    const invalidYearValues = params.year?.filter((yr) => yr.length !== 4);
    if (invalidYearValues && invalidYearValues.length > 0) {
      logger.info("found invalid years =", [...invalidYearValues]);

      return responseCreator.toValidationError([{ path: "year", message: "incorrect value" }]);
    }

    const yearParams = [params.year].flat().map((yr) => Number(yr));

    const responselist = await getIncomeTags(yearParams);

    return responseCreator.toSuccessResponse(responselist.list);
  });

  demoMock.onPost(new RegExp(rootPath + "/id/.+/receipts/id/.+")).reply(async (config) => {
    const logger = getLogger("uploadReceipt", rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const filedata = config.data as File;

    const urlParts = config.url?.split("/") || [];
    logger.debug("url=", config.url, ", urlParts=", [urlParts]);
    const incomeId = urlParts.slice(4, 5)[0];
    const validationErrors = validateDataType({ incomeId: incomeId }, ["incomeId"], "uuid");
    if (validationErrors.length > 0) {
      logger.debug("validationErrors =", validationErrors, "incomeId =", incomeId);
      return responseCreator.toValidationError(validationErrors);
    }
    const receiptId = urlParts.slice(-1)[0];

    await saveReceiptFileData(filedata, incomeId, receiptId, ExpenseBelongsTo.Income);

    return responseCreator.toSuccessResponse("saved");
  });

  demoMock.onGet(new RegExp(rootPath + "/id/.+/receipts/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const urlParts = config.url?.split("/") || [];
    const incomeId = urlParts.slice(4, 5)[0];
    const receiptId = urlParts.slice(-1)[0];

    const validationErrors = validateDataType({ incomeId: incomeId, receiptId: receiptId }, ["incomeId", "receiptId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getReceiptFileData(incomeId, receiptId, ExpenseBelongsTo.Income);
    if (result.error) {
      responseCreator.toUnknownError(result.error);
    }

    return responseCreator.toSuccessResponse(result.data);
  });

  demoMock.onGet(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const incomeId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ incomeId: incomeId }, ["incomeId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getIncomeDetails(incomeId);
    if (result.error) {
      return responseCreator.toNotFoundError("income does not exist. cannot be retrieved");
    }

    return responseCreator.toSuccessResponse(result.getDetails);
  });
};
