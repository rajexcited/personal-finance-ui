export const PAGE_URL = {
  loginPage: {
    shortUrl: "login",
    fullUrl: "/login",
  },
  signupPage: {
    shortUrl: "signup",
    fullUrl: "/signup",
  },
  logoutPage: {
    shortUrl: "logout",
    fullUrl: "/logout",
  },
  expenseJournalRoot: {
    shortUrl: "expense-journal",
    fullUrl: "/expense-journal",
  },
  addExpense: {
    shortUrl: "expense/add",
    fullUrl: "/expense-journal/expense/add",
  },
  updateExpense: {
    shortUrl: "expense/:expenseId/update",
    fullUrl: "/expense-journal/expense/:expenseId/update",
    paramKey: ":expenseId",
  },
  pymtAccountsRoot: {
    shortUrl: "payment-accounts",
    fullUrl: "/payment-accounts",
  },
  addPymAccount: {
    shortUrl: "account/add",
    fullUrl: "/payment-accounts/account/add",
  },
  updatePymAccount: {
    shortUrl: "account/:accountId/update",
    fullUrl: "/payment-accounts/account/:accountId/update",
    paramKey: ":accountId",
  },
  deletePymAccount: {
    shortUrl: "account/delete",
    fullUrl: "/payment-accounts/account/delete",
  },
  settingsRoot: {
    shortUrl: "settings",
    fullUrl: "/settings",
  },
  expenseCategorySettings: {
    shortUrl: "expense-category",
    fullUrl: "/settings/expense-category",
  },
  pymtAccountTypeSettings: {
    shortUrl: "pymt-account-type",
    fullUrl: "/settings/pymt-account-type",
  },
  tagsSettings: {
    shortUrl: "tags",
    fullUrl: "/settings/tags",
  },
  profileSettings: {
    shortUrl: "profile",
    fullUrl: "/settings/profile",
  },
  securitySettings: {
    shortUrl: "security",
    fullUrl: "/settings/security",
  },
};
