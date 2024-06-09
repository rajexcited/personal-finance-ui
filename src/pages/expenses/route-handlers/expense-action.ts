import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { ExpenseService, ReceiptProps } from "../services";
import { HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../services";

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

const expenseAddUpdateActionHandler = async (request: Request) => {
  try {
    // const data = await request.json();
    const formdata = await request.formData();
    const receipts: ReceiptProps[] = JSON.parse(formdata.get("receipts") as string);
    receipts.forEach((rct) => (rct.file = formdata.get(rct.id) as File));

    const expenseId = formdata.get("expenseId") as string;
    await expenseService.updateExpenseReceipts(receipts, expenseId);

    await expenseService.addUpdateExpense({
      id: expenseId,
      billName: formdata.get("billname") as string,
      paymentAccountName: formdata.get("pymtaccName") as string,
      amount: formdata.get("amount") as string,
      description: formdata.get("description") as string,
      purchasedDate: formdata.get("purchasedDate") as string,
      tags: (formdata.get("tags") as string).split(","),
      verifiedTimestamp: formdata.get("verifiedDateTime") as string,
      expenseItems: JSON.parse(formdata.get("expenseItems") as string),
      expenseCategoryName: formdata.get("categoryName") as string,
      receipts: receipts,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
    });

    return redirect(PAGE_URL.expenseJournalRoot.fullUrl);
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const expenseDeleteActionHandler = async (request: Request) => {
  try {
    const formdata = await request.formData();
    const expenseId = formdata.get("expenseId") as string;
    await expenseService.removeExpense(expenseId);
    const response: RouteHandlerResponse<string> = {
      type: "success",
      data: "expense is deleted",
    };
    return response;
  } catch (e) {
    console.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
