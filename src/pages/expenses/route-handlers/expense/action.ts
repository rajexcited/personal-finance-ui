import { ActionFunctionArgs, json } from "react-router-dom";
import {
  purchaseService,
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  ExpenseBelongsTo,
  ExpenseFields,
  refundService,
  incomeService,
} from "../../services";

const rhLogger = getLogger("route.handler.expense.action", null, null, "DEBUG");

export const expenseActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "DELETE") {
    return await expenseDeleteActionHandler(request);
  }
  const error: RouteHandlerResponse<null, any> = {
    type: "error",
    errorMessage: "action not supported",
    data: {
      request: {
        method: request.method,
      },
    },
  };
  return json(error, { status: HttpStatusCode.InternalServerError });
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
    const expenseId = getFormData(formdata, "id") + "-dummy";
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
      data: belongsTo + " is deleted",
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
