import {
  axios,
  handleRestErrors,
  convertAuditFieldsToDateInstance,
  getLogger,
  MyLocalDatabase,
  LocalDBStore,
  LocalDBStoreIndex,
  ConfigTypeStatus,
  TagsService,
  TagBelongsTo,
} from "../../../shared";
import { PymtAccountTypeService } from "./account-type-service";
import { PymtAccStatus, PymtAccountFields } from "./field-types";
import pMemoize from "p-memoize";
import ExpiryMap from "expiry-map";
import pDebounce from "p-debounce";
import ms from "ms";

export const PymtAccountService = () => {
  const accountTypeService = PymtAccountTypeService();
  const paymentAccountDb = new MyLocalDatabase<PymtAccountFields>(LocalDBStore.PaymentAccount);
  const tagService = TagsService();
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
    { cache: new ExpiryMap(15 * 1000) }
  );

  const updateAccountType = (accountTypeMap: Map<string, string>, pymtAccount: PymtAccountFields) => {
    if (pymtAccount.typeId && accountTypeMap.has(pymtAccount.typeId)) {
      pymtAccount.typeName = accountTypeMap.get(pymtAccount.typeId) as string;
    } else if (pymtAccount.typeName) {
      pymtAccount.typeId = accountTypeMap.get(pymtAccount.typeName) as string;
    }
  };

  const getPymtAccountList = async (status?: PymtAccStatus) => {
    const logger = getLogger("getPymtAccountList", _logger);

    try {
      const pymtAccounts = await paymentAccountDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status || PymtAccStatus.Enable);
      if (pymtAccounts.length > 0) {
        await initializePymtAccountTags();
        return pymtAccounts;
      }

      const pymtAccListResponsePromise = axios.get(rootPath, { params: { status: status || PymtAccStatus.Enable } });
      const accountTypesEnumPromise = getAccountTypesEnum();
      const pymtAccTagPromise = initializePymtAccountTags();

      await Promise.all([pymtAccListResponsePromise, accountTypesEnumPromise, pymtAccTagPromise]);
      const response = await pymtAccListResponsePromise;
      const accountsResponse = response.data as PymtAccountFields[];

      const accountTypesEnum = await accountTypesEnumPromise;
      const dbAddPymtAccPromises = accountsResponse.map((pymtAccount) => {
        updateAccountType(accountTypesEnum, pymtAccount);
        convertAuditFieldsToDateInstance(pymtAccount.auditDetails);
        return paymentAccountDb.addUpdateItem(pymtAccount);
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
      const count = await paymentAccountDb.count();

      if (count === 0) {
        const pymtAccountsPromise = getPymtAccountList();
        const pymtAccounts = await pymtAccountsPromise;
        const foundPymtAccount = pymtAccounts.find((pymtacc) => pymtacc.id === accountId);
        if (foundPymtAccount) {
          return foundPymtAccount;
        }
      }
      const response = await axios.get(`${rootPath}/id/${accountId}`);
      const pymtAccResponse = response.data as PymtAccountFields;
      const accountTypesEnum = await getAccountTypesEnum();

      updateAccountType(accountTypesEnum, pymtAccResponse);
      convertAuditFieldsToDateInstance(pymtAccResponse.auditDetails);
      await paymentAccountDb.addUpdateItem(pymtAccResponse);
      await tagService.updateTags(TagBelongsTo.PaymentAccounts, pymtAccResponse.tags);

      return pymtAccResponse;
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
      await tagService.updateTags(TagBelongsTo.PaymentAccounts, pymtAccountResponse.tags);
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
      const pymtAccountResponse = response.data as PymtAccountFields;
      const accountTypeMap = await getAccountTypesEnum();
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

  const getPymtAccountTypes = () => {
    return accountTypeService.getAccountTypes(ConfigTypeStatus.Enable);
  };

  const initializePymtAccountTags = async () => {
    const logger = getLogger("initializePymtAccountTags", _logger, null, "DEBUG");
    const tagCount = await tagService.getCount(TagBelongsTo.PaymentAccounts);
    logger.debug("tagCount =", tagCount);
    if (tagCount > 0) {
      return;
    }

    const response = await axios.get(`${rootPath}/tags`);
    logger.debug("api call response", response);
    await tagService.updateTags(TagBelongsTo.PaymentAccounts, response.data);
  };

  const getPymtAccountTags = async () => {
    const tagList = await tagService.getTags(TagBelongsTo.PaymentAccounts);
    return tagList;
  };

  return {
    getPymtAccountList: pDebounce(getPymtAccountList, ms("1 sec")),
    getPymtAccount: pDebounce(getPymtAccount, ms("1 sec")),
    addUpdatePymtAccount,
    removePymtAccount,
    getPymtAccountTags,
    getPymtAccountTypes,
  };
};
