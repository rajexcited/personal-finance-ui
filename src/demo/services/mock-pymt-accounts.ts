import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateDataType } from "./common-validators";
import { addUpdatePymtAccount, deletePymtAccount, getPymtAccounts } from "../mock-db/pymt-acc-db";
import { PymtAccountFields } from "../../pages/pymt-accounts/services";

const MockPaymentAccounts = (demoMock: MockAdapter) => {
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

  demoMock.onGet("/payment/accounts").reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = await getPymtAccounts();
    return responseCreator.toSuccessResponse(result.list);
  });
};

export default MockPaymentAccounts;
