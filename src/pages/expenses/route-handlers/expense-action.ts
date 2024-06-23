import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { ExpenseFields, ExpenseService, ReceiptProps, ReceiptUploadError } from "../services";
import { HttpStatusCode, RouteHandlerResponse, getLogger, handleRouteActionError } from "../../../services";

const expenseService = ExpenseService();

export const expenseActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await expenseAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseDeleteActionHandler(request);
  }
  const error: RouteHandlerResponse<any> = {
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

const expenseAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("expenseAddUpdateActionHandler");
  try {
    const formdata = await request.formData();

    let modifiedReceipts: ReceiptProps[] = [];
    try {
      const receipts: ReceiptProps[] = getFormData(formdata, "receipts");
      logger.info("receipts without files =", receipts);
      receipts.forEach((rct) => (rct.file = formdata.get(rct.id) as File));
      logger.info(
        "receipt files to upload =",
        receipts.map((r) => r.file).filter((f) => f)
      );
      modifiedReceipts = await expenseService.updateExpenseReceipts(receipts);
    } catch (e) {
      if (e instanceof ReceiptUploadError) {
        return e.getRouteActionErrorResponse();
      }
      return handleRouteActionError(e);
    }

    await expenseService.addUpdateExpense({
      id: getFormData(formdata, "id"),
      billName: getFormData(formdata, "billName"),
      paymentAccountId: getFormData(formdata, "paymentAccountId"),
      paymentAccountName: getFormData(formdata, "paymentAccountName"),
      amount: getFormData(formdata, "amount"),
      description: getFormData(formdata, "description"),
      purchasedDate: getFormData(formdata, "purchasedDate"),
      tags: getFormData(formdata, "tags"),
      verifiedTimestamp: getFormData(formdata, "verifiedTimestamp"),
      expenseItems: getFormData(formdata, "expenseItems"),
      expenseCategoryName: getFormData(formdata, "expenseCategoryName"),
      expenseCategoryId: getFormData(formdata, "expenseCategoryId"),
      receipts: modifiedReceipts,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
    });

    return redirect(PAGE_URL.expenseJournalRoot.fullUrl);
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const expenseDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("expenseDeleteActionHandler");
  try {
    const formdata = await request.formData();
    const expenseId = getFormData(formdata, "id");
    await expenseService.removeExpense(expenseId);
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: "expense is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
