import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { configSessionData } from "./mock-config-type";
import { auditData } from "./userDetails";

const MockPaymentAccounts = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/accounts\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const accountId = (config.url || "").replace("/accounts/", "");
    const error = validateUuid(accountId, "accountId");
    if (error) {
      return responseCreator.toValidationError(error);
    }
    const result = PymtAccountsSessionData.deleteAccount(accountId);
    if (result.error) {
      return responseCreator.toValidationError([
        { loc: ["accountId"], msg: "payment account with given accountId does not exist." },
      ]);
    }
    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    let result: { added?: any; updated?: any };
    if ("accountId" in data && data.accountId) {
      // update
      const err = validateUuid(data.accountId, "accountId");
      if (err) {
        return responseCreator.toValidationError(err);
      }
      result = PymtAccountsSessionData.addUpdateAccount({ ...data, ...auditData(data.createdBy, data.createdOn) });
    } else {
      result = PymtAccountsSessionData.addUpdateAccount({ ...data, accountId: uuidv4(), ...auditData() });
    }

    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/accounts").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const result = PymtAccountsSessionData.getAccounts();
    return responseCreator.toSuccessResponse(result.list);
  });
};

function SessionData() {
  const accounts: any[] = [];

  const init = () => {
    const accTypeId = (accTypeName: string) =>
      configSessionData.getPaymentAccountTypes().list.find((item: any) => item.name === accTypeName)?.configId;

    accounts.push({
      accountId: uuidv4(),
      shortName: "cash",
      accountName: "cash",
      typeId: accTypeId("cash"),
      tags: "cash",
      description: "my cash, notes or coins",
    });
    accounts.push({
      accountId: uuidv4(),
      shortName: "bofa demo checking",
      accountName: "checking 1",
      accountNumber: "ch1234",
      typeId: accTypeId("checking"),
      tags: "bank,primary",
      institutionName: "bank of america",
      description: "Bank of America checking dummy account",
    });
  };

  const getAccounts = () => {
    return { list: accounts };
  };

  const addUpdateAccount = (data: any) => {
    const existingAccountIndex = accounts.findIndex((acc) => acc.accountId === data.accountId);
    if (existingAccountIndex !== -1) {
      accounts[existingAccountIndex] = data;
      return { updated: data };
    }
    accounts.push(data);
    return { added: data };
  };

  const deleteAccount = (accountId: string) => {
    const existingAccount = accounts.find((acc) => acc.accountId === accountId);
    if (existingAccount !== -1) {
      const newAcc = [...accounts];
      accounts.length = 0;
      newAcc.filter((acc) => acc.accountId !== accountId).forEach((acc) => accounts.push(acc));
      return { deleted: existingAccount };
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
