import { LoaderFunctionArgs } from "react-router-dom";
import {
  ConfigResource,
  getLogger,
  RouteHandlerResponse,
  NotFoundError,
  handleRouteActionError,
  refundService,
  PurchaseRefundFields,
  refundReasonService,
  PurchaseService,
  PurchaseFields,
} from "../../services";
import { PymtAccountFields, PymtAccountService } from "../../../pymt-accounts/services";
import { ConfigTypeStatus, InvalidError, isUuid } from "../../../../shared";

const rhLogger = getLogger("route.handler.purchase.loader", null, null, "DISABLED");
const pymtAccountService = PymtAccountService();
const purchaseService = PurchaseService();

export interface RefundDetailLoaderResource {
  refundDetail?: PurchaseRefundFields;
  purchaseDetail?: PurchaseFields;
  paymentAccounts: PymtAccountFields[];
  refundReasons: ConfigResource[];
  refundTags: string[];
}

export const modifyRefundDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("modifyRefundDetailLoaderHandler", rhLogger);
  try {
    logger.debug("fetching refund details, params =", params);

    if (!params.refundId) {
      throw new InvalidError("missing refundId");
    }
    const details = await refundService.getDetails(params.refundId);
    logger.debug("retrieved refund details are", details);
    // this error should never have to handle because it should be thrown by rest api call
    if (!details) throw new NotFoundError("refund details not found");

    let purchaseDetails: PurchaseFields | undefined = undefined;
    if (details.purchaseId) {
      purchaseDetails = await purchaseService.getPurchase(details.purchaseId);
    }
    logger.debug("fetching other info");
    const reasonList = await refundReasonService.getReasonList(ConfigTypeStatus.Enable);
    const paymentAccounts = await pymtAccountService.getPymtAccountList();
    const refundTags = await refundService.getTags();
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<RefundDetailLoaderResource, null> = {
      type: "success",
      data: {
        refundDetail: { ...details, purchaseDetails: purchaseDetails },
        purchaseDetail: purchaseDetails,
        paymentAccounts,
        refundReasons: reasonList,
        refundTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const addRefundDetailLoaderHandler = async ({ params }: LoaderFunctionArgs) => {
  const logger = getLogger("addRefundDetailLoaderHandler", rhLogger);
  try {
    logger.debug("fetching refund details, params =", params);
    const purchaseId = params.purchaseId;
    let purchaseDetails: PurchaseFields | undefined = undefined;
    if (purchaseId && isUuid(params.purchaseId)) {
      purchaseDetails = await purchaseService.getPurchase(purchaseId);
    } else if (purchaseId !== "unknown") {
      throw new InvalidError("unable to recognize purchaseId");
    }

    const reasonList = await refundReasonService.getReasonList(ConfigTypeStatus.Enable);
    const paymentAccounts = await pymtAccountService.getPymtAccountList();
    const refundTags = await refundService.getTags();

    const response: RouteHandlerResponse<RefundDetailLoaderResource, null> = {
      type: "success",
      data: {
        refundDetail: undefined,
        purchaseDetail: purchaseDetails,
        paymentAccounts,
        refundReasons: reasonList,
        refundTags,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
