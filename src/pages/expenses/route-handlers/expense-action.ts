import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { PAGE_URL } from "../../root";
import { ExpenseService, ReceiptProps } from "../services";

const expenseService = ExpenseService();

export const expenseActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await expenseAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await expenseDeleteActionHandler(request);
  }
};

const expenseAddUpdateActionHandler = async (request: Request) => {
  try {
    // const data = await request.json();
    const formdata = await request.formData();
    const purchasedDate = new Date(formdata.get("purchasedDate") as string);
    const expenseItemsStr = formdata.get("expenseItems") as string;
    const verifiedDateTime = formdata.get("verifiedDateTime") as string;
    const receipts: ReceiptProps[] = JSON.parse(formdata.get("receipts") as string);
    receipts.forEach((rct) => {
      rct.lastUpdatedDate = new Date(rct.lastUpdatedDate);
      const file = formdata.get(rct.id) as File;
      if (file) rct.file = file;
    });

    await expenseService.addUpdateExpense({
      expenseId: formdata.get("expenseId") as string,
      billname: formdata.get("billname") as string,
      pymtaccName: formdata.get("pymtaccName") as string,
      amount: formdata.get("amount") as string,
      description: formdata.get("description") as string,
      purchasedDate,
      tags: formdata.get("tags") as string,
      verifiedDateTime: verifiedDateTime ? new Date(verifiedDateTime) : undefined,
      expenseItems: JSON.parse(expenseItemsStr),
      categoryName: formdata.get("categoryName") as string,
      receipts,
    });
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }

  return redirect(PAGE_URL.expenseJournalRoot.fullUrl);
};

const expenseDeleteActionHandler = async (request: Request) => {
  try {
    const formdata = await request.formData();
    const expenseId = formdata.get("expenseId") as string;
    await expenseService.removeExpense(expenseId);
    return "deleted";
  } catch (e) {
    const err = e as Error;
    return { errorMessage: err.message };
  }
};
