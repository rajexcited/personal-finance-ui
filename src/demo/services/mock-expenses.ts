import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { configSessionData } from "./mock-config-type";
import { auditData } from "./userDetails";
import dateutil from "date-and-time";
import { PymtAccountsSessionData } from "./mock-pymt-accounts";
import { difference } from "../../services";
import { Receipts } from "./expense-receipts-db";

const MockExpenses = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/expenses\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const expenseId = (config.url || "").replace("/expenses/", "");
    const error = validateUuid(expenseId, "expenseId");
    if (error) {
      return responseCreator.toValidationError(error);
    }

    const result = expensesSessionData.deleteExpense(expenseId);
    if (result.error) {
      return responseCreator.toValidationError([
        { loc: ["expenseId"], msg: "expense with given expenseId does not exist." },
      ]);
    }

    return responseCreator.toSuccessResponse(result.deleted);
  });

  demoMock.onPost("/expenses").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    let result: { added?: any; updated?: any };
    if ("expenseId" in data && data.expenseId) {
      // update
      const err = validateUuid(data.expenseId, "expenseId");
      if (err) {
        return responseCreator.toValidationError(err);
      }
      result = expensesSessionData.addUpdateExpense({ ...data, ...auditData(data.createdBy, data.createdOn) });
    } else {
      result = expensesSessionData.addUpdateExpense({ ...data, expenseId: uuidv4(), ...auditData() });
    }
    if (result.updated) return responseCreator.toSuccessResponse(result.updated);
    // add
    return responseCreator.toCreateResponse(result.added);
  });

  demoMock.onGet("/expenses").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const result = expensesSessionData.getExpenses();
    return responseCreator.toSuccessResponse(result.list);
  });

  demoMock.onPost(/\/expenses.+\/receipts/).reply(async (config) => {
    const responseCreator = AxiosResponseCreator(config);
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
      return responseCreator.toValidationError([{ loc: ["file"], msg: "file cannot be larger than 2 MB" }]);
    }
    if (data.type !== "image/jpeg" && data.type !== "image/png" && data.type !== "application/pdf") {
      return responseCreator.toValidationError([{ loc: ["type"], msg: "unsupported file type of receipt" }]);
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
  const expenses: any[] = [];

  const init = () => {
    const categoryId = (categoryName: string) => {
      return configSessionData.getExpenseCategories().list.find((item: any) => item.name === categoryName)?.configId;
    };

    const pymtAccId = (accname: string) => {
      return PymtAccountsSessionData.getAccounts().list.find((acc) =>
        acc.shortName.toLowerCase().includes(accname.toLowerCase())
      )?.accountId;
    };

    expenses.push({
      expenseId: uuidv4(),
      billname: "burger restaurant",
      amount: "21.20",
      description: "this is dummy expense for demo purpose",
      tags: "outdoor,dining,trip",
      pymtaccId: pymtAccId("checking"),
      purchasedDate: dateutil.addDays(new Date(), -10),
      categoryId: categoryId("hangout"),
      receipts: [],
      expenseItems: [],
    });

    const parentExpenseId = uuidv4();
    expenses.push({
      expenseId: parentExpenseId,
      billname: "grocery store",
      amount: "63.80",
      description: "this is dummy expense for demo purpose",
      tags: "get2gethor,potluck",
      pymtaccId: pymtAccId("cash"),
      purchasedDate: dateutil.addDays(new Date(), -1),
      categoryId: categoryId("food shopping"),
      verifiedDateTime: dateutil.addHours(new Date(), -1),
      receipts: [],
      expenseItems: [
        {
          parentExpenseId: parentExpenseId,
          expenseId: uuidv4(),
          billname: "snacks",
          amount: "14.34",
          tags: "kids,breaktime,hangout",
          description: "for breakfast, break time during play or evening hangout",
          categoryId: categoryId("hangout"),
        },
        {
          parentExpenseId: parentExpenseId,
          expenseId: uuidv4(),
          billname: "breakfast",
          amount: "8.7",
          tags: "breakfast,dairy",
          description: "milk, bread, butter, jaam",
        },
        {
          parentExpenseId: parentExpenseId,
          expenseId: uuidv4(),
          billname: "non stick pan",
          amount: "39.7",
          tags: "utensil,kitchen",
          categoryId: categoryId("home stuffs"),
        },
      ],
    });
  };

  const getExpenses = () => {
    console.debug(
      "expense list",
      expenses.map((xpns) => xpns.expenseId),
      expenses.length,
      expenses
    );
    return { list: expenses };
  };

  const addUpdateExpense = (data: any) => {
    const existingExpenseIndex = expenses.findIndex((xpns) => xpns.expenseId === data.expenseId);
    data.expenseItems = data.expenseItems || [];
    data.expenseId = data.expenseId || uuidv4();
    data.expenseItems.forEach((item: any) => {
      item.expenseId = (existingExpenseIndex !== -1 ? item.expenseId : "") || uuidv4();
      item.parentExpenseId = data.expenseId;
      delete item.id;
      delete item.categoryName;
    });
    delete data.pymtaccName;
    console.debug("add or update expense", data.expenseId, data);

    if (existingExpenseIndex !== -1) {
      console.debug("difference", JSON.stringify(difference(data, expenses[existingExpenseIndex])));
      expenses[existingExpenseIndex] = data;
      return { updated: data };
    }
    expenses.push(data);
    return { added: data };
  };

  const deleteExpense = (expenseId: string) => {
    const existingExpense = expenses.find((xpns) => xpns.expenseId === expenseId);
    if (existingExpense !== -1) {
      const newAcc = [...expenses];
      expenses.length = 0;
      newAcc.filter((xpns) => xpns.expenseId !== expenseId).forEach((xpns) => expenses.push(xpns));
      return { deleted: existingExpense };
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
