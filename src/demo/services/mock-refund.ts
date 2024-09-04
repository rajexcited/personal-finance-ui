import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { getReceiptFileData, saveReceiptFileData } from "../mock-db/receipts-db";
import { getLogger } from "../../shared";
import { ExpenseBelongsTo, PurchaseRefundFields } from "../../pages/expenses/services";
import { addUpdateRefund, deleteRefund, getRefundDetails, getRefundTags } from "../mock-db/refund-db";

type RefundParam = Partial<Record<"status" | "pageNo" | "pageMonths" | "year", string[]>>;
const _rootLogger = getLogger("mock.api.expenses.refund", null, null, "DEBUG");
const rootPath = "/expenses/refund";

export const MockRefund = (demoMock: MockAdapter) => {
  demoMock.onDelete(new RegExp(rootPath + "/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const refundId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ refundId: refundId }, ["refundId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await deleteRefund(refundId);
    if (result.error) {
      return responseCreator.toNotFoundError("refund does not exist. cannot be deleted");
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
    const data = JSON.parse(config.data) as PurchaseRefundFields;

    const missingErrors = missingValidation(data, ["id", "billName", "amount", "description", "tags", "refundDate", "receipts", "reasonId"]);
    const notUuidErrors = validateDataType(data, ["id", "paymentAccountId", "purchaseId", "reasonId"], "uuid");
    const notStringErrors = validateDataType(data, ["billName", "amount", "description", "refundDate"], "string");
    const notArrayErrors = validateDataType(data, ["receipts", "tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    logger.info("validationErrors =", validationErrors);
    if (validationErrors.length > 0) {
      logger.info("found validation errors for data =", data);
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdateRefund({ ...data, belongsTo: ExpenseBelongsTo.PurchaseRefund });
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

    const params = config.params as RefundParam;
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

    const responselist = await getRefundTags(yearParams);

    return responseCreator.toSuccessResponse(responselist.list);
  });

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
    const refundId = urlParts.slice(4, 5)[0];
    const validationErrors = validateDataType({ refundId: refundId }, ["refundId"], "uuid");
    if (validationErrors.length > 0) {
      logger.debug("validationErrors =", validationErrors, "refundId =", refundId);
      return responseCreator.toValidationError(validationErrors);
    }
    const receiptName = urlParts.slice(-1)[0];

    await saveReceiptFileData(filedata, refundId, receiptName, ExpenseBelongsTo.PurchaseRefund);

    return responseCreator.toSuccessResponse("saved");
  });

  demoMock.onGet(new RegExp(rootPath + "/id/.+/receipts/id/.+")).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const urlParts = config.url?.split("/") || [];
    const refundId = urlParts.slice(4, 5)[0];
    const receiptId = urlParts.slice(-1)[0];

    const validationErrors = validateDataType({ refundId: refundId, receiptId: receiptId }, ["refundId", "receiptId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getReceiptFileData(refundId, receiptId, ExpenseBelongsTo.PurchaseRefund);
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
    const refundId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ refundId: refundId }, ["refundId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await getRefundDetails(refundId);
    if (result.error) {
      return responseCreator.toNotFoundError("refund does not exist. cannot be retrieved");
    }

    return responseCreator.toSuccessResponse(result.getDetails);
  });
};
