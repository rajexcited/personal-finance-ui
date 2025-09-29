import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { PurchaseFields } from "../../pages/expenses/services";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/receipts-db";
import { getLogger } from "../../shared";
import { ExpenseBelongsTo } from "../../pages/expenses/services";
import { addUpdatePurchase, deletePurchase, getPurchaseDetails, getPurchaseTags } from "../mock-db/purchase-db";

type PurchaseParam = Partial<Record<"status" | "pageNo" | "pageMonths" | "year", string[]>>;
const rootLogger = getLogger("mock.api.expenses.purchase", null, null, "DISABLED");
const rootPath = "/expenses/purchase";

export const MockPurchase = (demoMock: MockAdapter) => {
  demoMock.onDelete(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
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

    const result = await deletePurchase(purchaseId);
    if (result.error) {
      return responseCreator.toNotFoundError("purchase does not exist. cannot be deleted");
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
    const data = JSON.parse(config.data) as PurchaseFields;

    const missingErrors = missingValidation(data, ["id", "billName", "items", "purchaseDate", "receipts", "tags"]);
    const notUuidErrors = validateDataType(data, ["id", "purchaseTypeId", "paymentAccountId"], "uuid");
    const notStringErrors = validateDataType(data, ["billName", "amount", "description", "purchaseDate", "verifiedTimestamp"], "string");
    const notArrayErrors = validateDataType(data, ["items", "receipts", "tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    logger.info("validationErrors =", validationErrors);
    if (validationErrors.length > 0) {
      logger.info("found validation errors for data =", data);
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdatePurchase({ ...data, belongsTo: ExpenseBelongsTo.Purchase });
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

    const params = config.params as PurchaseParam;
    const missingErrors = missingValidation(params, ["year"]);

    logger.info("found missingErrors for purchasedYear param =", [...missingErrors]);
    if (missingErrors.length > 0) {
      return responseCreator.toValidationError(missingErrors);
    }

    const dataTypeErrors = validateDataType(params, ["year"], "arraynumber");
    logger.info("found dataType arraynumber Errors for purchasedYear param =", [...dataTypeErrors]);
    if (dataTypeErrors.length > 0) {
      return responseCreator.toValidationError(dataTypeErrors);
    }

    const invalidYearValues = params.year?.filter((yr) => yr.length !== 4);
    if (invalidYearValues && invalidYearValues.length > 0) {
      logger.info("found invalid purchasedYears =", [...invalidYearValues]);

      return responseCreator.toValidationError([{ path: "purchasedYear", message: "incorrect value" }]);
    }

    const purchasedYearParams = [params.year].flat().map((yr) => Number(yr));

    const responselist = await getPurchaseTags(purchasedYearParams);

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
    const purchaseId = urlParts.slice(4, 5)[0];
    const validationErrors = validateDataType({ purchaseId: purchaseId }, ["purchaseId"], "uuid");
    if (validationErrors.length > 0) {
      logger.debug("validationErrors =", validationErrors, "purchaseId =", purchaseId);
      return responseCreator.toValidationError(validationErrors);
    }
    const receiptId = urlParts.slice(-1)[0];

    await saveReceiptFileData(filedata, purchaseId, receiptId, ExpenseBelongsTo.Purchase);

    return responseCreator.toSuccessResponse("saved");
  });

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

    const result = await getReceiptFileData(purchaseId, receiptId, ExpenseBelongsTo.Purchase);
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
    const purchaseId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ purchaseId: purchaseId }, ["purchaseId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getPurchaseDetails(purchaseId);
    if (result.error) {
      return responseCreator.toNotFoundError("purchase does not exist. cannot be retrieved");
    }

    return responseCreator.toSuccessResponse(result.getDetails);
  });
};
