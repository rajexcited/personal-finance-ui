import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { validateUuid } from "./common-validators";
import { v4 as uuidv4 } from "uuid";
import { auditData } from "./userDetails";

const belongsToAccType = "pymt-account-type";
const belongsToExpenseCategory = "expense-category";

const MockConfigType = (demoMock: MockAdapter) => {
  demoMock.onDelete(/\/config\/types\/.+/).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const configId = (config.url || "").replace("/config/types/", "");
    const error = validateUuid(configId, "configId");
    if (error) {
      return responseCreator.toValidationError(error);
    }
    return responseCreator.toSuccessResponse({
      belongsTo: "belongsTo",
      configId: configId,
      name: "type",
      status: "deleted",
      value: "type",
      description: "type",
      ...auditData(),
    });
  });

  demoMock.onPost("/config/types/").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    if ("configId" in data) {
      // update
      const err = validateUuid(data.configId, "configId");
      if (err) {
        return responseCreator.toValidationError(err);
      }

      return responseCreator.toSuccessResponse({ ...data, ...auditData(data.createdBy, data.createdOn) });
    }
    // add
    return responseCreator.toCreateResponse({
      ...data,
      configId: uuidv4(),
      ...auditData(),
    });
  });

  demoMock.onGet("/config/types", { params: { belongsTo: belongsToAccType } }).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    return responseCreator.toCreateResponse(consfigSessionData.getPaymentAccountTypes());
  });

  demoMock
    .onGet("/config/types", { params: { belongsTo: belongsToAccType, status: ["enable", "disable"] } })
    .reply((config) => {
      const responseCreator = AxiosResponseCreator(config);
      const acctypes = consfigSessionData
        .getPaymentAccountTypes()
        .filter((acctype: any) => config.params.status.includes(acctype.status));

      return responseCreator.toCreateResponse(acctypes);
    });

  demoMock.onGet("/config/types", { params: { belongsTo: belongsToAccType, status: ["enable"] } }).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const acctypes = consfigSessionData
      .getPaymentAccountTypes()
      .filter((acctype: any) => config.params.status.includes(acctype.status));

    return responseCreator.toCreateResponse(acctypes);
  });

  demoMock.onGet("/config/types", { params: { belongsTo: belongsToAccType } }).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const acctypes = consfigSessionData.getPaymentAccountTypes();

    return responseCreator.toCreateResponse(acctypes);
  });

  demoMock.onGet("/config/types", { params: { belongsTo: belongsToExpenseCategory } }).reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    return responseCreator.toCreateResponse(consfigSessionData.getExpenseCategories());
  });
};

function SessionData() {
  const sessionData: any = {};

  const randomStatus = () => {
    const statuses = ["enable", "disable", "deleted"];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  };

  const getPaymentAccountTypes = () => {
    if (!sessionData.pymtAccTypes) {
      const defaultTypes = ["checking", "savings", "credit card", "loan", "cash", "gift card"];

      sessionData.pymtAccTypes = defaultTypes.map((type) => ({
        belongsTo: belongsToAccType,
        configId: uuidv4(),
        name: type,
        status: randomStatus(),
        value: type,
        description: type + " account type",
        ...auditData(),
      }));
      sessionData.pymtAccTypes[0].status = "enable";
    }
    return sessionData.pymtAccTypes;
  };

  const getExpenseCategories = () => {
    if (!sessionData.expenseCategories) {
      const defaultCategories = [
        "fee",
        "commute",
        "food shopping",
        "health",
        "home stuffs",
        "investment",
        "maintenance",
        "nri transfer",
        "hangout",
        "gift",
        "shopping",
      ];

      const defaultExpenseCategories = defaultCategories.map((category) => ({
        belongsTo: belongsToExpenseCategory,
        configId: uuidv4(),
        name: category,
        status: randomStatus(),
        value: category,
        description: "Expense category is " + category + ". Used to tag expense transactions.",
        ...auditData(),
      }));
    }
    return sessionData.expenseCategories;
  };

  return {
    getPaymentAccountTypes,
    getExpenseCategories,
  };
}

export const consfigSessionData = SessionData();

export default MockConfigType;
