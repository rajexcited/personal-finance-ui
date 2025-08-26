import { ActionFunctionArgs, redirect } from "react-router";
import { getFullPath } from "../../../root";
import {
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  ExpenseBelongsTo,
  IncomeFields,
  incomeService,
  ExpenseStatus
} from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";
import { getFormData } from "../common";
import { responseJson } from "../../../../shared";

const rhLogger = getLogger("route.handler.income.action", null, null, "DISABLED");

export const incomeActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await incomeAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await incomeDeleteActionHandler(request);
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

const incomeAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("incomeAddUpdateActionHandler", rhLogger);
  try {
    const getIncomeFormData = getFormData<IncomeFields>;
    const formdata = await request.formData();

    const receipts: ReceiptProps[] = getIncomeFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await incomeService.addUpdateDetails({
      id: getIncomeFormData(formdata, "id"),
      billName: getIncomeFormData(formdata, "billName"),
      paymentAccountId: getIncomeFormData(formdata, "paymentAccountId"),
      paymentAccountName: getIncomeFormData(formdata, "paymentAccountName"),
      amount: getIncomeFormData(formdata, "amount"),
      description: getIncomeFormData(formdata, "description"),
      incomeDate: getIncomeFormData(formdata, "incomeDate"),
      tags: getIncomeFormData(formdata, "tags"),
      incomeTypeId: getIncomeFormData(formdata, "incomeTypeId"),
      incomeTypeName: getIncomeFormData(formdata, "incomeTypeName"),
      personIds: getIncomeFormData(formdata, "personIds"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.Income,
      status: ExpenseStatus.Enable,
      currencyProfileId: getIncomeFormData(formdata, "currencyProfileId")
    });

    return redirect(getFullPath("expenseJournalRoot"));
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const incomeDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("incomeDeleteActionHandler", rhLogger);
  try {
    const formdata = await request.formData();
    const incomeId = getFormData(formdata, "id");
    await incomeService.removeDetails(incomeId);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "income is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
