import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization, validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { configSessionData } from "./mock-config-type";
import { auditData } from "./userDetails";
import dateutil from "date-and-time";
import { PymtAccountsSessionData } from "./mock-pymt-accounts";
import { difference, formatTimestamp } from "../../services";
import { Receipts } from "./expense-receipts-db";
import { ExpenseFields } from "../../pages/expenses/services";
import { PymtAccountFields } from "../../pages/pymt-accounts/services";
import { ExpenseStatus } from "../../pages/expenses/services/field-types";

const MockExpenses = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/expenses\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const expenseId = (config.url || "").replace("/expenses/", "");
    const error = validateUuid(expenseId, "expenseId");
    if (error) {
      return responseCreator.toValidationError([error]);
    }

    const result = expensesSessionData.deleteExpense(expenseId);
    if (result.error) {
      return responseCreator.toValidationError([{ path: "expenseId", message: "expense with given expenseId does not exist." }]);
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/expenses").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }
    const data = JSON.parse(config.data);

    let result: { added?: any; updated?: any };
    if ("expenseId" in data && data.expenseId) {
      // update
      const err = validateUuid(data.expenseId, "expenseId");
      if (err) {
        return responseCreator.toValidationError([err]);
      }
      result = expensesSessionData.addUpdateExpense({ ...data, auditDetails: auditData(data.createdBy, data.createdOn) });
    } else {
      result = expensesSessionData.addUpdateExpense({ ...data, expenseId: uuidv4(), auditDetails: auditData() });
    }
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/expenses").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const result = expensesSessionData.getExpenses();
    return responseCreator.toSuccessResponse(result.list);
  });

  demoMock.onPost(/\/expenses.+\/receipts/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);

    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const formdata = config.data as FormData;
    const data: any = {};
    formdata.forEach((val, key) => {
      data[key] = val;
    });

    const missingErrors = missingValidation(data, ["file", "type", "name"]);
    if (missingErrors) {
      return responseCreator.toValidationError(missingErrors);
    }
    const file = data.file as File;
    if (file.size >= 2 * 1024 * 1024) {
      // 2 MB
      return responseCreator.toValidationError([{ path: "file", message: "file cannot be larger than 2 MB" }]);
    }
    if (data.type !== "image/jpeg" && data.type !== "image/png" && data.type !== "application/pdf") {
      return responseCreator.toValidationError([{ path: "type", message: "unsupported file type of receipt" }]);
    }
    const result = await Receipts.save(file);

    return responseCreator.toSuccessResponse({
      id: result.id,
      lastUpdatedDate: result.lastUpdatedDate,
      fileName: result.file.name,
      url: result.url,
    });
  });
};

function SessionData() {
  const expenses: ExpenseFields[] = [];

  const init = () => {
    const categoryId = (categoryName: string) => {
      return configSessionData.getExpenseCategories().list.find((item) => item.name === categoryName)?.id;
    };

    const pymtAccId = (accname: string) => {
      const pymtAccs = PymtAccountsSessionData.getAccounts().list as PymtAccountFields[];
      return pymtAccs.find((acc) => acc.shortName.toLowerCase().includes(accname.toLowerCase()))?.id;
    };

    expenses.push({
      id: uuidv4(),
      billName: "burger restaurant",
      amount: "21.20",
      description: "this is dummy expense for demo purpose",
      tags: "outdoor,dining,trip".split(","),
      paymentAccountId: pymtAccId("checking"),
      purchasedDate: formatTimestamp(dateutil.addDays(new Date(), -10)),
      expenseCategoryId: categoryId("hangout"),
      receipts: [],
      expenseItems: [],
      auditDetails: auditData(),
      status: ExpenseStatus.Enable,
    });

    expenses.push({
      id: uuidv4(),
      billName: "grocery store",
      amount: "63.80",
      description: "this is dummy expense for demo purpose",
      tags: "get2gethor,potluck".split(","),
      paymentAccountId: pymtAccId("cash"),
      purchasedDate: formatTimestamp(dateutil.addDays(new Date(), -1)),
      expenseCategoryId: categoryId("food shopping"),
      verifiedTimestamp: formatTimestamp(dateutil.addHours(new Date(), -1)),
      receipts: [],
      auditDetails: auditData(),
      status: ExpenseStatus.Enable,
      expenseItems: [
        {
          id: uuidv4(),
          billName: "snacks",
          amount: "14.34",
          tags: "kids,breaktime,hangout".split(","),
          description: "for breakfast, break time during play or evening hangout",
          expenseCategoryId: categoryId("hangout"),
        },
        {
          id: uuidv4(),
          billName: "breakfast",
          amount: "8.7",
          tags: "breakfast,dairy".split(","),
          description: "milk, bread, butter, jaam",
        },
        {
          id: uuidv4(),
          billName: "non stick pan",
          amount: "39.7",
          tags: "utensil,kitchen".split(","),
          expenseCategoryId: categoryId("home stuffs"),
          description: "",
        },
      ],
    });
  };

  const getExpenses = () => {
    console.debug(
      "expense list",
      expenses.map((xpns) => xpns.id),
      expenses.length,
      expenses
    );
    return { list: expenses };
  };

  const addUpdateExpense = (data: ExpenseFields) => {
    const existingExpenseIndex = expenses.findIndex((xpns) => xpns.id === data.id);
    data.expenseItems = data.expenseItems || [];
    data.id = data.id || uuidv4();
    data.expenseItems.forEach((item: any) => {
      item.expenseId = (existingExpenseIndex !== -1 ? item.expenseId : "") || uuidv4();
      item.parentExpenseId = data.id;
      delete item.id;
      delete item.categoryName;
    });
    delete data.paymentAccountName;
    console.debug("add or update expense", data.id, data);

    if (existingExpenseIndex !== -1) {
      console.debug("difference", JSON.stringify(difference(data, expenses[existingExpenseIndex])));
      expenses[existingExpenseIndex] = data;
      return { updated: data };
    }
    expenses.push(data);
    return { added: data };
  };

  const deleteExpense = (expenseId: string) => {
    const existingExpense = expenses.find((xpns) => xpns.id === expenseId);
    if (existingExpense) {
      const newAcc = [...expenses];
      expenses.length = 0;
      newAcc.filter((xpns) => xpns.id !== expenseId).forEach((xpns) => expenses.push(xpns));
      return { deleted: { ...existingExpense, status: ExpenseStatus.Deleted } };
    }
    return { error: "expense not found" };
  };

  init();
  return {
    getExpenses,
    addUpdateExpense,
    deleteExpense,
  };
}

export const expensesSessionData = SessionData();

export default MockExpenses;
