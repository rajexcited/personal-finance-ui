import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { getFullPath } from "../../../root";
import {
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  ExpenseBelongsTo,
  IncomeFields,
  incomeService,
  ExpenseStatus,
} from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";

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
        method: request.method,
      },
    },
  };
  return json(error, { status: HttpStatusCode.InternalServerError });
};

type IncomeResourceKey = keyof IncomeFields;
const getFormData = (formData: FormData, formKey: IncomeResourceKey) => {
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

const incomeAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("incomeAddUpdateActionHandler", rhLogger);
  try {
    const formdata = await request.formData();

    const receipts: ReceiptProps[] = getFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await incomeService.addUpdateDetails({
      id: getFormData(formdata, "id"),
      billName: getFormData(formdata, "billName"),
      paymentAccountId: getFormData(formdata, "paymentAccountId"),
      paymentAccountName: getFormData(formdata, "paymentAccountName"),
      amount: getFormData(formdata, "amount"),
      description: getFormData(formdata, "description"),
      incomeDate: getFormData(formdata, "incomeDate"),
      tags: getFormData(formdata, "tags"),
      incomeTypeId: getFormData(formdata, "incomeTypeId"),
      incomeTypeName: getFormData(formdata, "incomeTypeName"),
      personIds: getFormData(formdata, "personIds"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.Income,
      status: ExpenseStatus.Enable,
      currencyProfileId: getFormData(formdata, "currencyProfileId"),
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
      data: "income is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
