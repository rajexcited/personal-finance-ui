import { openDB } from "idb";
import AccountTypeService from "./account-type-service";
import { axios, IDATABASE_TRACKER, convertAuditFields, handleRestErrors } from "../../../services";
import { PymtAccountFields } from "../store";

interface PymtAccountService {
  getPymtAccounts(): Promise<PymtAccountFields[]>;
  getPymtAccount(accountId: string): Promise<PymtAccountFields | null>;
  addUpdatePymtAccount(accDetails: PymtAccountFields): Promise<void>;
  removePymtAccount(accDetails: PymtAccountFields): Promise<void>;
  destroy(): void;
}

const PymtAccountServiceImpl = (): PymtAccountService => {
  const accountTypeService = AccountTypeService();
  const objectStoreName = IDATABASE_TRACKER.EXPENSE_DATABASE.PYMT_ACCOUNT_STORE.NAME;
  const dbPromise = openDB(IDATABASE_TRACKER.EXPENSE_DATABASE.NAME, IDATABASE_TRACKER.EXPENSE_DATABASE.VERSION);

  const getAccountTypesEnum = async () => {
    const acctypes = await accountTypeService.getAccountTypes();
    const typeMap = new Map<string, string>();
    acctypes.forEach((at) => {
      if (at.configId && at.name) {
        typeMap.set(at.configId, at.name);
        typeMap.set(at.name, at.configId);
      }
    });
    return typeMap;
  };

  const updateAccountType = (accountTypeMap: Map<string, string>, pymtAccount: PymtAccountFields) => {
    if (pymtAccount.typeId) pymtAccount.typeName = accountTypeMap.get(pymtAccount.typeId);
    else if (pymtAccount.typeName) pymtAccount.typeId = accountTypeMap.get(pymtAccount.typeName);
  };

  const getPymtAccounts = async () => {
    const db = await dbPromise;
    try {
      if ((await db.count(objectStoreName)) === 0) {
        const response = await axios.get("/accounts");
        const accountsResponse = response.data as PymtAccountFields[];
        const accountTypesEnum = await getAccountTypesEnum();
        const dbAddPymtAccPromises = accountsResponse.map((pymtAccount) => {
          updateAccountType(accountTypesEnum, pymtAccount);
          convertAuditFields(pymtAccount);
          return db.add(objectStoreName, pymtAccount);
        });
        await Promise.all(dbAddPymtAccPromises);
      }

      const pymtAccounts = (await db.getAll(objectStoreName)) as PymtAccountFields[];
      if (pymtAccounts) return pymtAccounts;

      return [];
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const getPymtAccount = async (accountId: string) => {
    const db = await dbPromise;
    try {
      if ((await db.count(objectStoreName, accountId)) === 0) {
        const pymtAccounts = (await getPymtAccounts()) as PymtAccountFields[];
        const pymtAccount = pymtAccounts.find((val) => val.accountId === accountId);
        if (pymtAccount) return pymtAccount;
      }

      const pymtAccount = (await db.get(objectStoreName, accountId)) as PymtAccountFields;
      if (pymtAccount) return pymtAccount;
      return null;
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addUpdatePymtAccount = async (pymtAccount: PymtAccountFields) => {
    const db = await dbPromise;

    try {
      const accountTypeMap = await getAccountTypesEnum();
      updateAccountType(accountTypeMap, pymtAccount);
      if ((await db.count(objectStoreName, pymtAccount.accountId)) === 0) {
        await addPymtAccount(pymtAccount);
      } else {
        await updatePymtAccount(pymtAccount);
      }
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const addPymtAccount = async (acc: PymtAccountFields) => {
    const data: any = {
      ...acc,
      accountId: null,
    };
    const accountTypeMap = await getAccountTypesEnum();
    updateAccountType(accountTypeMap, data);
    const response = await axios.post("/accounts", data);
    const pymtAccountResponse = response.data as PymtAccountFields;
    updateAccountType(accountTypeMap, pymtAccountResponse);
    convertAuditFields(pymtAccountResponse);
    const db = await dbPromise;
    await db.add(objectStoreName, pymtAccountResponse);
  };

  const updatePymtAccount = async (acc: PymtAccountFields) => {
    const data = { ...acc };
    const accountTypeMap = await getAccountTypesEnum();
    updateAccountType(accountTypeMap, data);
    const response = await axios.post("/accounts", data);
    const pymtAccountResponse = response.data as PymtAccountFields;
    updateAccountType(accountTypeMap, pymtAccountResponse);
    convertAuditFields(pymtAccountResponse);
    const db = await dbPromise;
    await db.put(objectStoreName, pymtAccountResponse);
  };

  const removePymtAccount = async (acc: PymtAccountFields) => {
    const db = await dbPromise;
    try {
      const response = await axios.delete("/accounts/" + acc.accountId);
      await db.delete(objectStoreName, acc.accountId);
    } catch (e) {
      handleRestErrors(e as Error);
      console.error("not rest error", e);
      throw e;
    }
  };

  const destroy = () => {
    dbPromise.then((db) => db.close());
    accountTypeService.destroy();
  };

  return {
    getPymtAccounts,
    getPymtAccount,
    addUpdatePymtAccount,
    removePymtAccount,
    destroy,
  };
};

export default PymtAccountServiceImpl;
