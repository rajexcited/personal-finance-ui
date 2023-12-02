export const rootPath = process.env.REACT_APP_ROOT_PATH || "";

export const PAGE_URL = {
  loginPage: {
    shortUrl: "login",
    fullUrl: rootPath + "/login",
  },
  signupPage: {
    shortUrl: "signup",
    fullUrl: rootPath + "/signup",
  },
  logoutPage: {
    shortUrl: "logout",
    fullUrl: rootPath + "/logout",
  },
  expenseJournalRoot: {
    shortUrl: "expense-journal",
    fullUrl: rootPath + "/expense-journal",
  },
  addExpense: {
    shortUrl: "expense/add",
    fullUrl: rootPath + "/expense-journal/expense/add",
  },
  updateExpense: {
    shortUrl: "expense/:expenseId/update",
    fullUrl: rootPath + "/expense-journal/expense/:expenseId/update",
    paramKey: ":expenseId",
  },
  pymtAccountsRoot: {
    shortUrl: "payment-accounts",
    fullUrl: rootPath + "/payment-accounts",
  },
  addPymAccount: {
    shortUrl: "account/add",
    fullUrl: rootPath + "/payment-accounts/account/add",
  },
  updatePymAccount: {
    shortUrl: "account/:accountId/update",
    fullUrl: rootPath + "/payment-accounts/account/:accountId/update",
    paramKey: ":accountId",
  },
  deletePymAccount: {
    shortUrl: "account/delete",
    fullUrl: rootPath + "/payment-accounts/account/delete",
  },
  settingsRoot: {
    shortUrl: "settings",
    fullUrl: rootPath + "/settings",
  },
  expenseCategorySettings: {
    shortUrl: "expense-category",
    fullUrl: rootPath + "/settings/expense-category",
  },
  pymtAccountTypeSettings: {
    shortUrl: "pymt-account-type",
    fullUrl: rootPath + "/settings/pymt-account-type",
  },
  tagsSettings: {
    shortUrl: "tags",
    fullUrl: rootPath + "/settings/tags",
  },
  profileSettings: {
    shortUrl: "profile",
    fullUrl: rootPath + "/settings/profile",
  },
  securitySettings: {
    shortUrl: "security",
    fullUrl: rootPath + "/settings/security",
  },
};
