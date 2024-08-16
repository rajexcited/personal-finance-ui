import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { addUpdatePymtAccount, deletePymtAccount, getPymtAccountList } from "../mock-db/pymt-acc-db";
import { PymtAccStatus, PymtAccountFields } from "../../pages/pymt-accounts/services";
import { getLogger } from "../../services";

export const MockPaymentAccounts = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/payment\/accounts\/.+/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const accountId = (config.url || "").split("/").slice(-1)[0];
    const validationErrors = validateDataType({ paymentAccountId: accountId }, ["paymentAccountId"], "uuid");
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }
    const result = await deletePymtAccount(accountId);
    if (result.error) {
      return responseCreator.toNotFoundError(result.error);
    }
    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/payment/accounts").reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const data = JSON.parse(config.data) as PymtAccountFields;
    const missingErrors = missingValidation(data, ["id", "shortName", "tags"]);
    const notUuidErrors = validateDataType(data, ["id", "typeId"], "uuid");
    const notStringErrors = validateDataType(data, ["accountIdNum", "description", "institutionName", "shortName", "status"], "string");
    const notArrayErrors = validateDataType(data, ["tags"], "array");
    const validationErrors = [...missingErrors, ...notUuidErrors, ...notStringErrors, ...notArrayErrors];
    if (validationErrors.length > 0) {
      return responseCreator.toValidationError(validationErrors);
    }

    const result = await addUpdatePymtAccount(data);

    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/payment/accounts/tags").reply(async (config) => {
    const logger = getLogger("mock.pymtAcc.getTags", null, null, "DEBUG");
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = await getPymtAccountList(undefined, logger);
    const responseList = result.list.flatMap((pa) => pa.tags);
    logger.debug("payment account size=", result.list.length, ", tags size =", responseList.length);
    return responseCreator.toSuccessResponse(responseList);
  });

  demoMock.onGet("/payment/accounts").reply(async (config) => {
    const logger = getLogger("mock.pymtAcc.getAccountList", null, null, "DEBUG");
    const responseCreator = AxiosResponseCreator(config);
    logger.debug("baseUrl =", config.baseURL, ", url=", config.url);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const statusParams: PymtAccStatus[] = [config.params.status || ""].flatMap((st) => st).filter((st) => st);
    const result = await getPymtAccountList(statusParams, logger);
    return responseCreator.toSuccessResponse(result.list);
  });
};
