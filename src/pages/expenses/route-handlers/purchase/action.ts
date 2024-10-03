import { ActionFunctionArgs, json, redirect } from "react-router-dom";
import { getFullPath } from "../../../root";
import {
  purchaseService,
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  PurchaseFields,
  ExpenseBelongsTo,
} from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";

const rhLogger = getLogger("route.handler.purchase.action", null, null, "DISABLED");

export const purchaseActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await purchaseAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await purchaseDeleteActionHandler(request);
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

type PurchaseResourceKey = keyof PurchaseFields;
const getFormData = (formData: FormData, formKey: PurchaseResourceKey) => {
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

const purchaseAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("purchaseAddUpdateActionHandler", rhLogger);
  try {
    const formdata = await request.formData();

    const receipts: ReceiptProps[] = getFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await purchaseService.addUpdatePurchase({
      id: getFormData(formdata, "id"),
      billName: getFormData(formdata, "billName"),
      paymentAccountId: getFormData(formdata, "paymentAccountId"),
      paymentAccountName: getFormData(formdata, "paymentAccountName"),
      amount: getFormData(formdata, "amount"),
      description: getFormData(formdata, "description"),
      purchasedDate: getFormData(formdata, "purchasedDate"),
      tags: getFormData(formdata, "tags"),
      verifiedTimestamp: getFormData(formdata, "verifiedTimestamp"),
      items: getFormData(formdata, "items"),
      purchaseTypeId: getFormData(formdata, "purchaseTypeId"),
      purchaseTypeName: getFormData(formdata, "purchaseTypeName"),
      personIds: getFormData(formdata, "personIds"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.Purchase,
    });

    return redirect(getFullPath("expenseJournalRoot"));
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const purchaseDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("purchaseDeleteActionHandler", rhLogger);
  try {
    const formdata = await request.formData();
    const purchaseId = getFormData(formdata, "id");
    await purchaseService.removePurchase(purchaseId);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "purchase is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
