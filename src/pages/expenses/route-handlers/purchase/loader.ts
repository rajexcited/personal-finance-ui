import { LoaderFunctionArgs } from "react-router-dom";
import {
  ConfigResource,
  PurchaseService,
  getLogger,
  RouteHandlerResponse,
  NotFoundError,
  handleRouteActionError,
  PurchaseFields,
} from "../../services";

const purchaseService = PurchaseService();
const rhLogger = getLogger("route.handler.purchase.loader", null, null, "INFO");

export interface PurchaseDetailLoaderResource {
  purchaseDetail: PurchaseFields | null;
  paymentAccounts: Map<string, string>;
  purchaseTypes: ConfigResource[];
  purchaseTags: string[];
}

export const purchaseDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("purchaseDetailLoaderHandler", rhLogger);
  try {
    logger.debug("fetching purchase details, params =", params);
    const details = await purchaseService.getPurchase(params.purchaseId as string);
    logger.debug("retrieved purchase details are", details);
    // this error should never have to handle because it should be thrown by rest api call
    if (!details) throw new NotFoundError("Purchase details not found");

    logger.debug("fetching other info");
    const purchaseTypes = await purchaseService.getPurchaseTypes();
    const paymentAccounts = await purchaseService.getPaymentAccountMap();
    const purchaseTags = await purchaseService.getPurchaseTags();
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<PurchaseDetailLoaderResource, null> = {
      type: "success",
      data: {
        purchaseDetail: details,
        paymentAccounts,
        purchaseTypes,
        purchaseTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const purchaseDetailSupportingLoaderHandler = async () => {
  const logger = getLogger("purchaseDetailSupportingLoaderHandler", rhLogger);
  try {
    const purchaseTypes = await purchaseService.getPurchaseTypes();
    const paymentAccounts = await purchaseService.getPaymentAccountMap();
    const purchaseTags = await purchaseService.getPurchaseTags();

    const response: RouteHandlerResponse<PurchaseDetailLoaderResource, null> = {
      type: "success",
      data: {
        purchaseDetail: null,
        paymentAccounts,
        purchaseTypes,
        purchaseTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
