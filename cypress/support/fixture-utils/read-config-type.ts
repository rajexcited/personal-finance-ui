import { ConfigBelongsTo } from "../api-resource-types";
import { getFixtureFile } from "./fixture-util";

export interface ConfigDetailType {
  ref: string;
  id: string;
  belongsTo: ConfigBelongsTo;
  name: string;
  description: string;
  tags: string[];
  value: string;
}

const aliasNames: Partial<Record<ConfigBelongsTo, string>> = {
  "purchase-type": "configPurchaseTypeMap",
  "income-type": "configIncomeTypeMap",
  "refund-reason": "configRefundReasonMap",
  "pymt-account-type": "configPaymentAccountTypeMap"
};

beforeEach(() => {
  for (let aliasName of Object.values(aliasNames)) {
    cy.wrap({}).as(aliasName);
  }
});

const getAliasName = (belongsTo: ConfigBelongsTo) => {
  const aliasName = aliasNames[belongsTo];
  if (!aliasName) {
    throw new Error(`${belongsTo} is not configured for fixture. cannot be updated.`);
  }
  return aliasName;
};

export const updateConfigType = (belongsTo: ConfigBelongsTo, key: string, configDetails: ConfigDetailType) => {
  const aliasName = getAliasName(belongsTo);
  cy.get(`@${aliasName}`).then((data: any) => {
    const configPurchaseTypeMap: Record<string, ConfigDetailType> = data;
    configPurchaseTypeMap[key] = configDetails;
    cy.wrap(configPurchaseTypeMap).as(aliasName);
  });
};

export const updatePurchaseType = (refKey: string, purchaseTypeDetail: ConfigDetailType) => {
  updateConfigType(ConfigBelongsTo.PurchaseType, refKey, purchaseTypeDetail);
};

const populateConfigTypeMap = (belongsTo: ConfigBelongsTo) => {
  const aliasName = getAliasName(belongsTo);
  getFixtureFile(`settings/config-types/${belongsTo}`).then((data) => {
    const configTypeMap: Record<string, ConfigDetailType> = {};
    Object.entries(data).forEach(([key, value]) => {
      const val = typeof value === "object" ? (value as ConfigDetailType) : null;
      configTypeMap[key] = {
        ref: key,
        id: val?.id || "",
        belongsTo: belongsTo,
        name: val?.name || "",
        tags: val?.tags || [],
        value: val?.value || "",
        description: val?.description || ""
      };
    });
    const refKeys = Object.keys(data);
    cy.log(`total ${refKeys.length} ${belongsTo} config are populated. ref keys: ${refKeys}`);
    console.log(`total ${refKeys.length} ${belongsTo} config are populated. ref keys: ${refKeys}`);
    cy.wrap(configTypeMap).as(aliasName);
  });
};

const findConfigType = (configTypeMap: Record<string, ConfigDetailType>, configTypeRef: string) => {
  if (configTypeMap[configTypeRef]) {
    return configTypeMap[configTypeRef];
  }
  console.log(`No matching config type found for ref [${configTypeRef}]`);
  return null;
};

/**
 * reads expense purchase details from fixture test data setup file
 *
 * @param expensePurchaseRefs
 * @returns
 */
export const getConfigTypeList = (belogsTo: ConfigBelongsTo, configTypeRefs: string[]) => {
  const aliasName = getAliasName(belogsTo);

  cy.get(`@${aliasName}`).then((data: any) => {
    const configTypeMap: Record<string, ConfigDetailType> = data;
    if (Object.keys(configTypeMap).length === 0) {
      populateConfigTypeMap(belogsTo);
    }
  });
  return cy.get(`@${aliasName}`).then((data: any) => {
    const configTypeMap: Record<string, ConfigDetailType> = data;
    const nonNullRefs = configTypeRefs.filter((r) => r !== null && r !== undefined).filter((r) => !!r);
    const results = nonNullRefs.map((ref) => findConfigType(configTypeMap, ref)).filter((cdt) => cdt !== null);
    return results;
  });
};

export const getConfigType = (belongsTo: ConfigBelongsTo, configTypeRef: string) => {
  return getConfigTypeList(belongsTo, [configTypeRef]).then((list) => {
    let cdt: ConfigDetailType | null = null;
    if (list.length) {
      cdt = list[0];
    }
    return cy.wrap(cdt);
  });
};

export const getPurchaseTypeList = (purchaseTypeRefs: string[]) => {
  const aliasName = getAliasName(ConfigBelongsTo.PurchaseType);
  return getConfigTypeList(ConfigBelongsTo.PurchaseType, purchaseTypeRefs);
};

export const getPurchaseType = (purchaseTypeRef: string) => {
  return getConfigType(ConfigBelongsTo.PurchaseType, purchaseTypeRef);
};

export const getIncomeTypeList = (incomeTypeRefs: string[]) => {
  const aliasName = getAliasName(ConfigBelongsTo.IncomeType);
  return getConfigTypeList(ConfigBelongsTo.IncomeType, incomeTypeRefs);
};

export const getRefundReasonList = (refundReasonRefs: string[]) => {
  const aliasName = getAliasName(ConfigBelongsTo.RefundReason);
  return getConfigTypeList(ConfigBelongsTo.RefundReason, refundReasonRefs);
};

export const getPaymentAccountTypeList = (paymentAccountTypeRefs: string[]) => {
  const aliasName = getAliasName(ConfigBelongsTo.PaymentAccountType);
  return getConfigTypeList(ConfigBelongsTo.PaymentAccountType, paymentAccountTypeRefs);
};

export const getIncomeType = (incomeTypeRef: string) => {
  return getConfigType(ConfigBelongsTo.IncomeType, incomeTypeRef);
};

export const getRefundReason = (reasonRef: string) => {
  return getConfigType(ConfigBelongsTo.RefundReason, reasonRef);
};
