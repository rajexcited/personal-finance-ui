import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateAuthorization, validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { configSessionData } from "./mock-config-type";
import { auditData } from "./userDetails";
import { PymtAccStatus, PymtAccountFields } from "../../pages/pymt-accounts/services";

const MockPaymentAccounts = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/payment\/accounts\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const accountId = (config.url || "").replace("/accounts/", "");
    const error = validateUuid(accountId, "accountId");
    if (error) {
      return responseCreator.toValidationError([error]);
    }
    const result = PymtAccountsSessionData.deleteAccount(accountId);
    if (result.error) {
      return responseCreator.toValidationError([{ path: "accountId", message: "payment account with given accountId does not exist." }]);
    }
    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/payment/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const data = JSON.parse(config.data);
    let result: { added?: any; updated?: any };
    if ("accountId" in data && data.accountId) {
      // update
      const err = validateUuid(data.accountId, "accountId");
      if (err) {
        return responseCreator.toValidationError([err]);
      }
      result = PymtAccountsSessionData.addUpdateAccount({ ...data, auditDetails: auditData(data.createdBy, data.createdOn) });
    } else {
      result = PymtAccountsSessionData.addUpdateAccount({ ...data, accountId: uuidv4(), auditDetails: auditData() });
    }

    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/payment/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = PymtAccountsSessionData.getAccounts();
    return responseCreator.toSuccessResponse(result.list);
  });
};

function SessionData() {
  const accounts: Partial<PymtAccountFields>[] = [];

  const init = () => {
    const accTypeId = (accTypeName: string) => configSessionData.getPaymentAccountTypes().list.find((item: any) => item.name === accTypeName)?.id;

    accounts.push({
      id: uuidv4(),
      shortName: "cash",
      accountIdNum: "cash",
      typeId: accTypeId("cash"),
      tags: "cash".split(","),
      description: "my cash, notes or coins",
      auditDetails: auditData(),
      status: PymtAccStatus.Enable,
    });
    accounts.push({
      id: uuidv4(),
      shortName: "bofa demo checking",
      accountIdNum: "checking 1",
      typeId: accTypeId("checking"),
      tags: "bank,primary".split(","),
      institutionName: "bank of america",
      description: "Bank of America checking dummy account",
      auditDetails: auditData(),
      status: PymtAccStatus.Enable,
    });
  };

  const getAccounts = () => {
    return { list: accounts };
  };

  const addUpdateAccount = (data: PymtAccountFields) => {
    const existingAccountIndex = accounts.findIndex((acc) => acc.id === data.id);
    if (existingAccountIndex !== -1) {
      accounts[existingAccountIndex] = data;
      return { updated: data };
    }
    accounts.push(data);
    return { added: data };
  };

  const deleteAccount = (accountId: string) => {
    const existingAccount = accounts.find((acc) => acc.id === accountId);
    if (existingAccount) {
      const newAcc = [...accounts];
      accounts.length = 0;
      newAcc.filter((acc) => acc.id !== accountId).forEach((acc) => accounts.push(acc));
      return { deleted: { ...existingAccount, status: PymtAccStatus.Deleted } };
    }
    return { error: "payment account not found" };
  };

  init();
  return {
    getAccounts,
    addUpdateAccount,
    deleteAccount,
  };
}

export const PymtAccountsSessionData = SessionData();

export default MockPaymentAccounts;
