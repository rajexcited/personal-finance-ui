import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { getFullPath } from "../../../root";
import {
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  PurchaseRefundFields,
  refundService,
  ExpenseStatus,
} from "../../services";
import { ExpenseBelongsTo } from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";

const rhLogger = getLogger("route.handler.purchase.action", null, null, "DISABLED");

export const refundActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await refundAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await refundDeleteActionHandler(request);
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

type RefundResourceKey = keyof PurchaseRefundFields;
const getFormData = (formData: FormData, formKey: RefundResourceKey) => {
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

const refundAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("refundAddUpdateActionHandler", rhLogger);
  try {
    const formdata = await request.formData();
    const receipts: ReceiptProps[] = getFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await refundService.addUpdateDetails({
      id: getFormData(formdata, "id"),
      billName: getFormData(formdata, "billName"),
      paymentAccountId: getFormData(formdata, "paymentAccountId"),
      paymentAccountName: getFormData(formdata, "paymentAccountName"),
      amount: getFormData(formdata, "amount"),
      description: getFormData(formdata, "description"),
      refundDate: getFormData(formdata, "refundDate"),
      tags: getFormData(formdata, "tags"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.PurchaseRefund,
      status: ExpenseStatus.Enable,
      purchaseId: getFormData(formdata, "purchaseId"),
      reasonId: getFormData(formdata, "reasonId"),
      reasonValue: getFormData(formdata, "reasonValue"),
    });

    return redirect(getFullPath("expenseJournalRoot"));
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const refundDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("refundDeleteActionHandler", rhLogger);
  try {
    const formdata = await request.formData();
    const refundId = getFormData(formdata, "id");
    await refundService.removeDetails(refundId);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "refund is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
