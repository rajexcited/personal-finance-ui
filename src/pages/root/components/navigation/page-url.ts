import { getLogger } from "../../services";

export const pathBaseName = process.env.REACT_APP_BASE_PATH;

const _logger = getLogger("navigation.pageurls", null, null, "DISABLED");

interface PageRouteResource {
  shortUrl: string;
  baseRouteId: RouteId | null;
}

type RouteId =
  | "rootPath"
  | "loginPage"
  | "signupPage"
  | "logoutPage"
  | "expenseJournalRoot"
  | "addPurchase"
  | "updatePurchase"
  | "addPurchaseRefund"
  | "updatePurchaseRefund"
  | "addIncome"
  | "updateIncome"
  | "pymtAccountsRoot"
  | "addPymAccount"
  | "updatePymAccount"
  | "settingsRoot"
  | "purchaseTypeSettings"
  | "pymtAccountTypeSettings"
  | "refundReasonSettings"
  | "incomeTypeSettings"
  | "sharePersonSettings"
  | "profileSettings"
  | "securitySettings";

const PAGE_URL: Record<RouteId, PageRouteResource> = {
  rootPath: {
    shortUrl: "/",
    baseRouteId: null,
  },
  loginPage: {
    shortUrl: "login",
    baseRouteId: "rootPath",
  },
  signupPage: {
    shortUrl: "signup",
    baseRouteId: "rootPath",
  },
  logoutPage: {
    shortUrl: "logout",
    baseRouteId: "rootPath",
  },
  expenseJournalRoot: {
    shortUrl: "expense-journal",
    baseRouteId: "rootPath",
  },
  addPurchase: {
    shortUrl: "purchase/add",
    baseRouteId: "expenseJournalRoot",
  },
  updatePurchase: {
    shortUrl: "purchase/:purchaseId/update",
    baseRouteId: "expenseJournalRoot",
  },
  addPurchaseRefund: {
    shortUrl: "purchase/:purchaseId/refund/add",
    baseRouteId: "expenseJournalRoot",
  },
  updatePurchaseRefund: {
    shortUrl: "purchase/refund/:refundId/update",
    baseRouteId: "expenseJournalRoot",
  },
  addIncome: {
    shortUrl: "income/add",
    baseRouteId: "expenseJournalRoot",
  },
  updateIncome: {
    shortUrl: "income/:incomeId/update",
    baseRouteId: "expenseJournalRoot",
  },
  pymtAccountsRoot: {
    shortUrl: "payment-accounts",
    baseRouteId: "rootPath",
  },
  addPymAccount: {
    shortUrl: "account/add",
    baseRouteId: "pymtAccountsRoot",
  },
  updatePymAccount: {
    shortUrl: "account/:accountId/update",
    baseRouteId: "pymtAccountsRoot",
  },
  settingsRoot: {
    shortUrl: "settings",
    baseRouteId: "rootPath",
  },
  purchaseTypeSettings: {
    shortUrl: "purchase-type",
    baseRouteId: "settingsRoot",
  },
  pymtAccountTypeSettings: {
    shortUrl: "pymt-account-type",
    baseRouteId: "settingsRoot",
  },
  refundReasonSettings: {
    shortUrl: "refund-reason",
    baseRouteId: "settingsRoot",
  },
  incomeTypeSettings: {
    shortUrl: "income-type",
    baseRouteId: "settingsRoot",
  },
  sharePersonSettings: {
    shortUrl: "share-person",
    baseRouteId: "settingsRoot",
  },
  profileSettings: {
    shortUrl: "profile",
    baseRouteId: "settingsRoot",
  },
  securitySettings: {
    shortUrl: "security",
    baseRouteId: "settingsRoot",
  },
};

const getParamKey = (routeResource: PageRouteResource) => {
  const logger = getLogger("getParamKey", _logger);
  const parts = routeResource.shortUrl.split(":");
  logger.debug("parts=", parts);
  let paramKey = null;
  if (parts.length === 2) {
    paramKey = ":" + parts[1].split("/")[0];
  }
  logger.debug("paramKey =", paramKey);
  return paramKey;
};

export const getFullPath = (routeId: RouteId | null, paramValue?: string) => {
  const logger = getLogger("getFullPath", _logger);
  logger.debug("routeId =", routeId, ", paramValue =", paramValue);
  if (!routeId) {
    return "";
  }

  const routeResource = PAGE_URL[routeId];
  const paramKey = getParamKey(routeResource);
  logger.debug("routeResource =", routeResource, ", paramKey =", paramKey);
  if (paramKey && !paramValue) {
    throw new Error("param value must be given for param key [" + paramKey + "]");
  }
  if (!paramKey && paramValue) {
    throw new Error("param key does not exists, hence param value[" + paramValue + "] is not required");
  }

  const parentFullPath: string = getFullPath(routeResource.baseRouteId);
  const slashMiddle = parentFullPath?.endsWith("/") || routeResource.shortUrl.startsWith("/") ? "" : "/";
  const baseFullPath = parentFullPath + slashMiddle;

  logger.debug("baseFullPath =", baseFullPath);
  if (paramValue && paramKey) {
    return baseFullPath + routeResource.shortUrl.replace(paramKey, paramValue);
  }

  return baseFullPath + routeResource.shortUrl;
};

export const getShortPath = (routeId: RouteId, paramValue?: string) => {
  const routeResource = PAGE_URL[routeId];
  if (paramValue) {
    const paramKey = getParamKey(routeResource);
    if (paramKey) {
      return routeResource.shortUrl.replace(paramKey, paramValue);
    }
  }
  return routeResource.shortUrl;
};
