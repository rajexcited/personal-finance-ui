import { axios, handleRestErrors, convertAuditFieldsToDateInstance, getLogger, MyLocalDatabase, LocalDBStore } from "../../../services";
import AccountTypeService from "./account-type-service";
import { PymtAccountFields } from "./field-types";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";

const PymtAccountServiceImpl = () => {
  const accountTypeService = AccountTypeService();
  const paymentAccountDb = new MyLocalDatabase<PymtAccountFields>(LocalDBStore.PaymentAccount);
  const rootPath = "/payment/accounts";
  const _logger = getLogger("service.payment-account");

  const getAccountTypesEnum = pMemoize(
    async () => {
      const acctypes = await accountTypeService.getAccountTypes();
      const typeMap = new Map<string, string>();
      acctypes.forEach((at) => {
        if (at.id && at.name) {
          typeMap.set(at.id, at.name);
          typeMap.set(at.name, at.id);
        }
      });
      return typeMap;
    },
    { cache: new ExpiryMap(2 * 1000) }
  );

  const updateAccountType = (accountTypeMap: Map<string, string>, pymtAccount: PymtAccountFields) => {
    if (pymtAccount.typeId && accountTypeMap.has(pymtAccount.typeId)) {
      pymtAccount.typeName = accountTypeMap.get(pymtAccount.typeId) as string;
    } else if (pymtAccount.typeName) {
      pymtAccount.typeId = accountTypeMap.get(pymtAccount.typeName) as string;
    }
  };

  const getPymtAccounts = async () => {
    const logger = getLogger("getPymtAccounts", _logger);

    try {
      const pymtAccounts = await paymentAccountDb.getAll();
      if (pymtAccounts.length > 0) {
        return pymtAccounts;
      }

      const response = await axios.get(rootPath);
      const accountsResponse = response.data as PymtAccountFields[];
      const accountTypesEnum = await getAccountTypesEnum();
      const dbAddPymtAccPromises = accountsResponse.map((pymtAccount) => {
        updateAccountType(accountTypesEnum, pymtAccount);
        convertAuditFieldsToDateInstance(pymtAccount.auditDetails);
        return paymentAccountDb.addItem(pymtAccount);
      });
      await Promise.all(dbAddPymtAccPromises);

      return accountsResponse;
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const getPymtAccount = async (accountId: string) => {
    const logger = getLogger("getPymtAccount", _logger);

    try {
      const pymtAccount = await paymentAccountDb.getItem(accountId);
      if (pymtAccount) {
        return pymtAccount;
      }
      const pymtAccounts = await getPymtAccounts();
      const foundPymtAccount = pymtAccounts.find((pymtacc) => pymtacc.id === accountId);
      return foundPymtAccount || null;
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const addUpdatePymtAccount = async (pymtAccount: PymtAccountFields) => {
    const logger = getLogger("addUpdatePymtAccount", _logger);

    try {
      const accountTypeMap = await getAccountTypesEnum();
      updateAccountType(accountTypeMap, pymtAccount);

      const response = await axios.post(rootPath, pymtAccount);
      const pymtAccountResponse = response.data as PymtAccountFields;
      updateAccountType(accountTypeMap, pymtAccountResponse);
      convertAuditFieldsToDateInstance(pymtAccountResponse.auditDetails);

      await paymentAccountDb.addUpdateItem(pymtAccountResponse);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const removePymtAccount = async (accountId: string) => {
    const logger = getLogger("removePymtAccount", _logger);

    try {
      const response = await axios.delete(`${rootPath}/id/${accountId}`);
      await paymentAccountDb.delete(accountId);
    } catch (e) {
      const err = e as Error;
      handleRestErrors(err, logger);
      logger.warn("not rest error", e);
      throw Error("unknown error");
    }
  };

  const getPymtAccountTags = async () => {
    const pymtAccounts = await getPymtAccounts();
    const tags = pymtAccounts.flatMap((acc) => acc.tags);

    return tags;
  };

  const getPymtAccountTypes = () => {
    return accountTypeService.getAccountTypes();
  };

  return {
    getPymtAccounts,
    getPymtAccount,
    addUpdatePymtAccount,
    removePymtAccount,
    getPymtAccountTags,
    getPymtAccountTypes,
  };
};

export default PymtAccountServiceImpl;
