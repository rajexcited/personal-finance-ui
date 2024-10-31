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
  getCacheOption,
  isNotBlank,
} from "../../../shared";
import * as pymtAccountTypeService from "./account-type-service";
import { PymtAccStatus, PymtAccountFields } from "./field-types";
import pMemoize, { pMemoizeClear } from "p-memoize";

const paymentAccountDb = new MyLocalDatabase<PymtAccountFields>(LocalDBStore.PaymentAccount);
const tagService = TagsService(TagBelongsTo.PaymentAccounts);
const rootPath = "/payment/accounts";
const _logger = getLogger("service.payment-account");

const getAccountTypesEnum = async () => {
  const acctypes = await pymtAccountTypeService.getAccountTypes();
  const typeMap = new Map<string, string>();
  acctypes.forEach((at) => {
    if (at.id && at.value) {
      typeMap.set(at.id, at.value);
      typeMap.set(at.value, at.id);
    }
  });
  return typeMap;
};

const updateAccountType = (accountTypeMap: Map<string, string>, pymtAccount: PymtAccountFields) => {
  if (pymtAccount.typeId && accountTypeMap.has(pymtAccount.typeId)) {
    pymtAccount.typeName = accountTypeMap.get(pymtAccount.typeId) as string;
  } else if (pymtAccount.typeName) {
    pymtAccount.typeId = accountTypeMap.get(pymtAccount.typeName) as string;
  }
};

export const getPymtAccountList = pMemoize(async (status?: PymtAccStatus) => {
  const logger = getLogger("getPymtAccountList", _logger);

  try {
    const pymtAccounts: PymtAccountFields[] = [];
    if (!status || status === PymtAccStatus.Enable) {
      const enablePymtAccPromise = paymentAccountDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, PymtAccStatus.Enable);
      const immutablePymtAccPromise = paymentAccountDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, PymtAccStatus.Immutable);
      const listOfAccounts = await Promise.all([enablePymtAccPromise, immutablePymtAccPromise]);
      const list = listOfAccounts.flatMap((pymtacc) => pymtacc);
      pymtAccounts.push(...list);
    } else {
      const statusPymtAccs = await paymentAccountDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status);
      pymtAccounts.push(...statusPymtAccs);
    }

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
      pymtAccount.dropdownTooltip = getDropdownTooltip(pymtAccount);
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
}, getCacheOption("1 min"));

export const getPymtAccount = pMemoize(async (accountId: string) => {
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
    pymtAccResponse.dropdownTooltip = getDropdownTooltip(pymtAccResponse);
    await paymentAccountDb.addUpdateItem(pymtAccResponse);
    await tagService.updateTags(pymtAccResponse.tags);

    return pymtAccResponse;
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("20 sec"));

export const addUpdatePymtAccount = pMemoize(async (pymtAccount: PymtAccountFields) => {
  const logger = getLogger("addUpdatePymtAccount", _logger);

  try {
    const accountTypeMap = await getAccountTypesEnum();
    updateAccountType(accountTypeMap, pymtAccount);

    const response = await axios.post(rootPath, pymtAccount);
    const pymtAccountResponse = response.data as PymtAccountFields;
    updateAccountType(accountTypeMap, pymtAccountResponse);
    convertAuditFieldsToDateInstance(pymtAccountResponse.auditDetails);
    pymtAccountResponse.dropdownTooltip = getDropdownTooltip(pymtAccount);

    await paymentAccountDb.addUpdateItem(pymtAccountResponse);
    await tagService.updateTags(pymtAccountResponse.tags);
    pMemoizeClear(getPymtAccountList);
    pMemoizeClear(getPymtAccount);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("5 sec"));

export const removePymtAccount = pMemoize(async (accountId: string) => {
  const logger = getLogger("removePymtAccount", _logger);

  try {
    const response = await axios.delete(`${rootPath}/id/${accountId}`);
    const pymtAccountResponse = response.data as PymtAccountFields;
    const accountTypeMap = await getAccountTypesEnum();
    updateAccountType(accountTypeMap, pymtAccountResponse);
    convertAuditFieldsToDateInstance(pymtAccountResponse.auditDetails);

    await paymentAccountDb.addUpdateItem(pymtAccountResponse);
    pMemoizeClear(getPymtAccountList);
    pMemoizeClear(getPymtAccount);
  } catch (e) {
    const err = e as Error;
    handleRestErrors(err, logger);
    logger.warn("not rest error", e);
    throw Error("unknown error");
  }
}, getCacheOption("5 sec"));

export const getPymtAccountTypes = () => {
  return pymtAccountTypeService.getAccountTypes(ConfigTypeStatus.Enable);
};

const initializePymtAccountTags = async () => {
  const logger = getLogger("initializePymtAccountTags", _logger, null, "DISABLED");
  const tagCount = await tagService.getCount();
  logger.debug("tagCount =", tagCount);
  if (tagCount > 0) {
    return;
  }

  const response = await axios.get(`${rootPath}/tags`);
  logger.debug("api call response", response);
  await tagService.updateTags(response.data);
};

export const getPymtAccountTags = async () => {
  const tagList = await tagService.getTags();
  return tagList;
};

const getDropdownTooltip = (pymtAccount: PymtAccountFields) => {
  const ddTooltipLines: string[] = [];
  let ddTooltip = "";
  ddTooltip = pymtAccount.description ? "Description:" + pymtAccount.description : "";
  if (isNotBlank(ddTooltip)) {
    // ddTooltipLines.push(" " + ddTooltip + "  ");
    ddTooltipLines.push(ddTooltip);
  }
  ddTooltip = pymtAccount.tags.length > 0 ? "Tags:" + pymtAccount.tags.join(",") : "";
  if (isNotBlank(ddTooltip)) {
    // ddTooltipLines.push(" " + ddTooltip + "  ");
    ddTooltipLines.push(ddTooltip);
  }

  ddTooltip = pymtAccount.typeName ? "Type:" + pymtAccount.typeName : "";
  if (isNotBlank(ddTooltip)) {
    // ddTooltipLines.push(" " + ddTooltip + "  ");
    ddTooltipLines.push(ddTooltip);
  }
  // return ddTooltipLines.join("&#10;&#13;");
  return ddTooltipLines.join("  ");
};
