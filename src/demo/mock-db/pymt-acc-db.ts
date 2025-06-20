import { PymtAccStatus, PymtAccountFields } from "../../pages/pymt-accounts/services";
import { LoggerBase, getLogger } from "../../shared";
import { auditData } from "../services/userDetails";
import { getDefaultCurrencyProfileId, getPaymentAccountTypes } from "./config-type-db";
import { LocalDBStore, LocalDBStoreIndex, MyLocalDatabase } from "./db";
import { v4 as uuidv4 } from "uuid";

const rootLogger = getLogger("mock.db.pymtAcc", null, null, "DISABLED");
const pymtAccDb = new MyLocalDatabase<PymtAccountFields>(LocalDBStore.PaymentAccount);

const init = async () => {
  const pymtAccTypes = (await getPaymentAccountTypes()).list;
  const accTypeId = (accTypeName: string) => pymtAccTypes.find((item: any) => item.name === accTypeName)?.id as string;

  const pymtAccs = await pymtAccDb.getAll();
  if (pymtAccs.length > 0) {
    return;
  }

  const currencyProfileId = await getDefaultCurrencyProfileId();

  await pymtAccDb.addItem({
    id: uuidv4(),
    shortName: "cash",
    accountIdNum: "cash",
    typeId: accTypeId("cash"),
    typeName: "",
    tags: ["cash"],
    description: "my cash, notes or coins",
    auditDetails: auditData(),
    status: PymtAccStatus.Immutable,
    dropdownTooltip: "",
    currencyProfileId: currencyProfileId
  });

  await pymtAccDb.addItem({
    id: uuidv4(),
    shortName: "bofa demo checking",
    accountIdNum: "checking 1",
    typeId: accTypeId("checking"),
    typeName: "",
    tags: "bank,primary".split(","),
    institutionName: "bank of america",
    description: "Bank of America checking dummy account",
    auditDetails: auditData(),
    status: PymtAccStatus.Enable,
    dropdownTooltip: "",
    currencyProfileId: currencyProfileId
  });
};

await init();

export const getPymtAccountList = async (statuses?: PymtAccStatus[], baseLogger?: LoggerBase) => {
  const logger = getLogger("getlist", rootLogger, baseLogger);

  const filterStatuses = !statuses || statuses.length === 0 ? [PymtAccStatus.Enable] : statuses;
  if (filterStatuses.includes(PymtAccStatus.Enable) && !filterStatuses.includes(PymtAccStatus.Immutable)) {
    filterStatuses.push(PymtAccStatus.Immutable);
  }
  const pymtAccPromises = filterStatuses.map(async (status) => {
    return await pymtAccDb.getAllFromIndex(LocalDBStoreIndex.ItemStatus, status);
  });
  const pymtAccList = (await Promise.all(pymtAccPromises)).flatMap((pymtAcc) => pymtAcc);
  logger.debug(
    "pymtAcc Ids =",
    pymtAccList.map((pymtAcc) => pymtAcc.id),
    ", size=",
    pymtAccList.length
  );
  return { list: pymtAccList };
};

export const isDuplicateShortName = async (data: PymtAccountFields) => {
  const allPaymentAccounts = await pymtAccDb.getAll();
  let isValid = true;
  for (let dbPymtAcc of allPaymentAccounts) {
    if (dbPymtAcc.shortName === data.shortName && dbPymtAcc.status !== PymtAccStatus.Deleted) {
      if (dbPymtAcc.id !== data.id) {
        isValid = false;
      }
      break;
    }
  }
  return !isValid;
};

export const addUpdatePymtAccount = async (data: PymtAccountFields) => {
  try {
    const existingPymtAcc = await pymtAccDb.getItem(data.id);
    if (existingPymtAcc) {
      const updatingPymtAcc: PymtAccountFields = {
        ...data,
        status: existingPymtAcc.status,
        auditDetails: auditData(existingPymtAcc.auditDetails.createdBy, existingPymtAcc.auditDetails.createdOn)
      };
      await pymtAccDb.addUpdateItem(updatingPymtAcc);
      return { updated: updatingPymtAcc };
    }
    const addedPymtAcc: PymtAccountFields = {
      ...data,
      id: uuidv4(),
      auditDetails: auditData(),
      status: PymtAccStatus.Enable
    };
    await pymtAccDb.addItem(addedPymtAcc);
    return { added: addedPymtAcc };
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export const deletePymtAccount = async (pymtAccountId: string) => {
  const existingPymtAcc = await pymtAccDb.getItem(pymtAccountId);

  if (existingPymtAcc && existingPymtAcc.status === PymtAccStatus.Enable) {
    const deletingPymtAcc: PymtAccountFields = {
      ...existingPymtAcc,
      status: PymtAccStatus.Deleted,
      auditDetails: auditData(existingPymtAcc.auditDetails.createdBy, existingPymtAcc.auditDetails.createdOn)
    };
    await pymtAccDb.addUpdateItem(deletingPymtAcc);
    return { deleted: { ...deletingPymtAcc } };
  }
  return { error: "payment account cannot be deleted" };
};
