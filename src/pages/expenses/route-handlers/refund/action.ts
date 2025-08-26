import { ActionFunctionArgs, redirect } from "react-router";
import { getFullPath } from "../../../root";
import {
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  PurchaseRefundFields,
  refundService,
  ExpenseStatus
} from "../../services";
import { ExpenseBelongsTo } from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";
import { getFormData } from "../common";
import { responseJson } from "../../../../shared";

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
        method: request.method
      }
    }
  };

  return responseJson(error, HttpStatusCode.InternalServerError);
};

const refundAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("refundAddUpdateActionHandler", rhLogger);
  const getRefundFormData = getFormData<PurchaseRefundFields>;
  try {
    const formdata = await request.formData();
    const receipts: ReceiptProps[] = getRefundFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await refundService.addUpdateDetails({
      id: getRefundFormData(formdata, "id"),
      billName: getRefundFormData(formdata, "billName"),
      paymentAccountId: getRefundFormData(formdata, "paymentAccountId"),
      paymentAccountName: getRefundFormData(formdata, "paymentAccountName"),
      amount: getRefundFormData(formdata, "amount"),
      description: getRefundFormData(formdata, "description"),
      refundDate: getRefundFormData(formdata, "refundDate"),
      tags: getRefundFormData(formdata, "tags"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.PurchaseRefund,
      status: ExpenseStatus.Enable,
      purchaseId: getRefundFormData(formdata, "purchaseId"),
      reasonId: getRefundFormData(formdata, "reasonId"),
      reasonValue: getRefundFormData(formdata, "reasonValue"),
      personIds: getRefundFormData(formdata, "personIds"),
      currencyProfileId: getRefundFormData(formdata, "currencyProfileId")
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
      data: "refund is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
