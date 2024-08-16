import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { PurchaseFields } from "../../pages/expenses/services";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/expense-receipts-db";
import { ExpenseFilter, addUpdateExpense, deleteExpense, getExpenseDetails, getExpenses } from "../mock-db/expense-db";
import { getLogger, subtractDates } from "../../services";
import { ExpenseStatus } from "../../pages/expenses/services/field-types";
import datetime from "date-and-time";

type PurchaseParam = Partial<Pick<Record<string, string[]>, "status" | "pageNo" | "pageMonths" | "purchasedYear">>;
const _rootLogger = getLogger("mock.api.expenses.purchase", null, null, "DEBUG");
const rootPath = "/expenses/purchase";

export const MockPurchase = (demoMock: MockAdapter) => {
  // demoMock.onDelete(/\/expenses\/id\/.+/).reply(async (config) => {
  demoMock.onDelete(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const purchaseId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ id: purchaseId }, ["id"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await deleteExpense(purchaseId);
    if (result.error) {
      return responseCreator.toNotFoundError("purchase does not exist. cannot be deleted");
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost(rootPath).reply(async (config) => {
    const logger = getLogger("addUpdate", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const data = JSON.parse(config.data) as PurchaseFields;

    const missingErrors = missingValidation(data, ["id", "billName", "items", "purchasedDate", "receipts", "tags"]);
    const notUuidErrors = validateDataType(data, ["id", "purchaseTypeId", "paymentAccountId"], "uuid");
    const notStringErrors = validateDataType(data, ["billName", "amount", "description", "purchasedDate", "verifiedTimestamp"], "string");
    const notArrayErrors = validateDataType(data, ["items", "receipts", "tags"], "array");
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

  demoMock.onGet(rootPath + "/tags").reply(async (config) => {
    const logger = getLogger("getTags", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const params = config.params as PurchaseParam;
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
        const purchaseParams: ExpenseFilter = {
          pageNo: i + 1,
          pageMonths: 12,
          status: [ExpenseStatus.Enable, ExpenseStatus.Deleted],
        };
        const promise = getExpenses(purchaseParams);
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

  // demoMock.onPost(/\/expenses\/purchase\/id\/.+\/receipts\/id\/.+/).reply(async (config) => {
  demoMock.onPost(new RegExp(rootPath + "/id/.+/receipts/id/.+")).reply(async (config) => {
    const logger = getLogger("uploadReceipt", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const filedata = config.data as File;

    const urlParts = config.url?.split("/") || [];
    logger.debug("url=", config.url, ", urlParts=", [urlParts]);
    const purchaseId = urlParts.slice(4, 5)[0];
    const validationErrors = validateDataType({ purchaseId: purchaseId }, ["purchaseId"], "uuid");
    if (validationErrors.length > 0) {
      logger.debug("validationErrors =", validationErrors, "purchaseId =", purchaseId);
      return responseCreator.toValidationError(validationErrors);
    }
    const receiptName = urlParts.slice(-1)[0];

    await saveReceiptFileData(filedata, purchaseId, receiptName);

    return responseCreator.toSuccessResponse("saved");
  });

  // demoMock.onGet(/\/expenses\/purchase\/id\/.+\/receipts\/id\/.+/).reply(async (config) => {
  demoMock.onGet(new RegExp(rootPath + "/id/.+/receipts/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const urlParts = config.url?.split("/") || [];
    const purchaseId = urlParts.slice(4, 5)[0];
    const receiptId = urlParts.slice(-1)[0];

    const validationErrors = validateDataType({ purchaseId: purchaseId, receiptId: receiptId }, ["purchaseId", "receiptId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getReceiptFileData(purchaseId, receiptId);
    if (result.error) {
      responseCreator.toUnknownError(result.error);
    }

    return responseCreator.toSuccessResponse(result.data);
  });

  // demoMock.onGet(/\/expenses\/purchase\/id\/.+/).reply(async (config) => {
  demoMock.onGet(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const purchaseId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ purchaseId: purchaseId }, ["purchaseId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getExpenseDetails(purchaseId);
    if (result.error) {
      return responseCreator.toNotFoundError("purchase does not exist. cannot be retrieved");
    }

    return responseCreator.toSuccessResponse(result.getDetails);
  });
};
