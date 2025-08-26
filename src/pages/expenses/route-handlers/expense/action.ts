import { ActionFunctionArgs } from "react-router";
import {
  purchaseService,
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  ExpenseBelongsTo,
  ExpenseFields,
  refundService,
  incomeService
} from "../../services";
import { incrementPageNoToLoadMoreMonths } from "./share-list";
import { responseJson } from "../../../../shared";

const rhLogger = getLogger("route.handler.expense.action", null, null, "DISABLED");

export const expenseActionHandler = async ({ request }: ActionFunctionArgs) => {
  let resp: Response | RouteHandlerResponse<any, any> | undefined = undefined;
  if (request.method === "DELETE") {
    resp = await expenseDeleteActionHandler(request);
  }
  if (request.method === "POST") {
    resp = await expensePostActionHandler(request);
  }
  if (resp) {
    return resp;
  }
  const error: RouteHandlerResponse<null, any> = {
    type: "error",
    errorMessage: "action not supported",
    data: {
      request: {
        method: request.method
      }
    }
  };
  return responseJson(error, HttpStatusCode.InternalServerError);
};

type ExpenseResourceKey = keyof ExpenseFields;
const getFormData = (formData: FormData, formKey: ExpenseResourceKey) => {
  const formValue = formData.get(formKey);

  if (formValue) {
    try {
      const jsonstr = formValue.toString();
      const jsonObj = JSON.parse(jsonstr);
      if (typeof jsonObj === "object") {
        return jsonObj;
      }
      return formValue.toString();
    } catch (ignore) {
      return formValue.toString();
    }
  }
  return null;
};

const expenseDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("expenseDeleteActionHandler", rhLogger);
  let formdata: FormData | null = null;
  try {
    formdata = await request.formData();
    const expenseId = getFormData(formdata, "id");
    const belongsTo = getFormData(formdata, "belongsTo");
    if (belongsTo === ExpenseBelongsTo.Purchase) {
      await purchaseService.removePurchase(expenseId);
    } else if (belongsTo === ExpenseBelongsTo.PurchaseRefund) {
      await refundService.removeDetails(expenseId);
    } else if (belongsTo === ExpenseBelongsTo.Income) {
      await incomeService.removeDetails(expenseId);
    }

    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: belongsTo + " is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    const overrideMessages: Record<string, string> = {};
    if (!formdata) {
      overrideMessages.default = "cannot delete expense";
    } else {
      const belongsTo = getFormData(formdata, "belongsTo");
      overrideMessages[HttpStatusCode.NotFound] = belongsTo + " is not found. hence it cannot be deleted.";
      overrideMessages[HttpStatusCode.InternalServerError] = `There was unknown error occur while deleting ${belongsTo}.`;
      overrideMessages.default = "cannot delete " + belongsTo;
    }
    return handleRouteActionError(e, overrideMessages);
  }
};

const expensePostActionHandler = async (request: Request) => {
  const logger = getLogger("expensePostActionHandler", rhLogger);

  try {
    const formdata = await request.formData();
    const loadMoreRequestBy = formdata.get("loadMore");
    logger.debug("loadMoreRequestBy=", loadMoreRequestBy);
    if (loadMoreRequestBy === "months") {
      incrementPageNoToLoadMoreMonths();
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "submitted request to load expenses for more months"
      };
      return response;
    }
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
