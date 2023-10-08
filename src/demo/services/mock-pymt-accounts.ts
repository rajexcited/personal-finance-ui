import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { consfigSessionData } from "./mock-config-type";
import { auditData } from "./userDetails";

const MockPaymentAccounts = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/accounts\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const accountId = (config.url || "").replace("/accounts/", "");
    const error = validateUuid(accountId, "accountId");
    if (error) {
      return responseCreator.toValidationError(error);
    }

    return responseCreator.toSuccessResponse({
      accountId: accountId,
      shortName: "bofa demo checking",
      accountName: "checking 1",
      accountNumber: "ch1234",
      tags: "bank,primary",
      institutionName: "bank of america",
      description: "Bank of America checking dummy account",
    });
  });

  demoMock.onPost("/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    console.log(data, config);
    if ("accountId" in data && data.accountId) {
      // update
      const err = validateUuid(data.configId, "accountId");
      if (err) {
        return responseCreator.toValidationError(err);
      }
      return responseCreator.toSuccessResponse({ ...data, ...auditData(data.createdBy, data.createdOn) });
    }
    // add
    return responseCreator.toCreateResponse({ ...data, accountId: uuidv4(), ...auditData() });
  });

  demoMock.onGet("/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const checkingAccTypeId = consfigSessionData
      .getPaymentAccountTypes()
      .find((item: any) => item.name === "checking")?.configId;

    const pymtAcc = {
      accountId: uuidv4(),
      shortName: "bofa demo checking",
      accountName: "checking 1",
      accountNumber: "ch1234",
      typeId: checkingAccTypeId,
      tags: "bank,primary",
      institutionName: "bank of america",
      description: "Bank of America checking dummy account",
    };

    return responseCreator.toSuccessResponse([pymtAcc]);
  });
};

export default MockPaymentAccounts;
