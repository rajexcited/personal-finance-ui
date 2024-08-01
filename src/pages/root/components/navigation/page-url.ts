export const pathBaseName = process.env.REACT_APP_BASE_PATH;

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
  | "addExpense"
  | "updateExpense"
  | "pymtAccountsRoot"
  | "addPymAccount"
  | "updatePymAccount"
  | "settingsRoot"
  | "expenseCategorySettings"
  | "pymtAccountTypeSettings"
  | "tagsSettings"
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
  addExpense: {
    shortUrl: "expense/add",
    baseRouteId: "expenseJournalRoot",
  },
  updateExpense: {
    shortUrl: "expense/:expenseId/update",
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
  expenseCategorySettings: {
    shortUrl: "expense-category",
    baseRouteId: "settingsRoot",
  },
  pymtAccountTypeSettings: {
    shortUrl: "pymt-account-type",
    baseRouteId: "settingsRoot",
  },
  tagsSettings: {
    shortUrl: "tags",
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

const getParamKey = (routeResource: PageRouteResource, paramValue: string | undefined) => {
  const parts = routeResource.shortUrl.split(":");
  let paramKey = null;
  if (parts.length === 2) {
    paramKey = parts[1].split("/")[0];
  }
  return paramKey;
};

export const getFullPath = (routeId: RouteId | null, paramValue?: string) => {
  if (!routeId) {
    return "";
  }

  const routeResource = PAGE_URL[routeId];
  const paramKey = getParamKey(routeResource, paramValue);
  if (paramKey && !paramValue) {
    throw new Error("param value must be given for param key [" + paramKey + "]");
  }
  if (!paramKey && paramValue) {
    throw new Error("param key does not exists, hence param value[" + paramValue + "] is not required");
  }

  const parentFullPath: string = getFullPath(routeResource.baseRouteId);
  const slashMiddle = parentFullPath?.endsWith("/") || routeResource.shortUrl.startsWith("/") ? "" : "/";
  const baseFullPath = parentFullPath + slashMiddle;
  if (paramValue && paramKey) {
    return baseFullPath + routeResource.shortUrl.replace(paramKey, paramValue);
  }

  return baseFullPath + routeResource.shortUrl;
};

export const getShortPath = (routeId: RouteId, paramValue?: string) => {
  const routeResource = PAGE_URL[routeId];
  if (paramValue) {
    const paramKey = getParamKey(routeResource, paramValue);
    if (paramKey) {
      return routeResource.shortUrl.replace(paramKey, paramValue);
    }
  }
  return routeResource.shortUrl;
};
