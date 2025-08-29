import { ActionFunctionArgs, redirect } from "react-router";
import { getFullPath } from "../../../root";
import {
  purchaseService,
  HttpStatusCode,
  RouteHandlerResponse,
  getLogger,
  handleRouteActionError,
  PurchaseFields,
  ExpenseBelongsTo
} from "../../services";
import { ReceiptProps } from "../../../../components/receipt";
import { uploadReceipts } from "../receipt/upload";
import { getFormData } from "../common";
import { responseJson } from "../../../../shared";

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
        method: request.method
      }
    }
  };
  return responseJson(error, HttpStatusCode.InternalServerError);
};

const purchaseAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("purchaseAddUpdateActionHandler", rhLogger);
  try {
    const getPurchaseFormData = getFormData<PurchaseFields>;
    const formdata = await request.formData();

    const receipts: ReceiptProps[] = getPurchaseFormData(formdata, "receipts");
    const uploadReceiptResult = await uploadReceipts(receipts, formdata, logger);

    if (uploadReceiptResult instanceof Response) {
      return uploadReceiptResult;
    }

    await purchaseService.addUpdatePurchase({
      id: getPurchaseFormData(formdata, "id"),
      billName: getPurchaseFormData(formdata, "billName"),
      paymentAccountId: getPurchaseFormData(formdata, "paymentAccountId"),
      paymentAccountName: getPurchaseFormData(formdata, "paymentAccountName"),
      amount: getPurchaseFormData(formdata, "amount"),
      description: getPurchaseFormData(formdata, "description"),
      purchaseDate: getPurchaseFormData(formdata, "purchaseDate"),
      tags: getPurchaseFormData(formdata, "tags"),
      verifiedTimestamp: getPurchaseFormData(formdata, "verifiedTimestamp"),
      items: getPurchaseFormData(formdata, "items"),
      purchaseTypeId: getPurchaseFormData(formdata, "purchaseTypeId"),
      purchaseTypeName: getPurchaseFormData(formdata, "purchaseTypeName"),
      personIds: getPurchaseFormData(formdata, "personIds"),
      receipts: uploadReceiptResult,
      auditDetails: { createdOn: new Date(), updatedOn: new Date() },
      belongsTo: ExpenseBelongsTo.Purchase,
      currencyProfileId: getPurchaseFormData(formdata, "currencyProfileId")
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
      data: "purchase is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
