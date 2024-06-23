import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { ExpenseFields } from "../../pages/expenses/services";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/expense-receipts-db";
import { addUpdateExpense, deleteExpense, getExpenseDetails, getExpenses } from "../mock-db/expense-db";
import { getLogger } from "../../services";

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
    const logger = getLogger("mock.expenses.addUpdate");
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

  demoMock.onGet("/expenses").reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = await getExpenses();

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
