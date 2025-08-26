import { LoaderFunctionArgs } from "react-router";
import {
  ConfigResource,
  getLogger,
  RouteHandlerResponse,
  NotFoundError,
  handleRouteActionError,
  refundService,
  PurchaseRefundFields,
  refundReasonService,
  purchaseService,
  PurchaseFields
} from "../../services";
import { PymtAccountFields, pymtAccountService } from "../../../pymt-accounts/services";
import { ConfigTypeStatus, InvalidError, isUuid } from "../../../../shared";
import { CurrencyProfileResource, currencyProfileService, SharePersonResource, sharePersonService } from "../../../settings/services";
import { getMissingSharePersons } from "../common";

const rhLogger = getLogger("route.handler.purchase.loader", null, null, "DISABLED");

export interface RefundDetailLoaderResource {
  refundDetail?: PurchaseRefundFields;
  purchaseDetail?: PurchaseFields;
  paymentAccounts: PymtAccountFields[];
  refundReasons: ConfigResource[];
  refundTags: string[];
  sharePersons: SharePersonResource[];
  currencyProfiles: CurrencyProfileResource[];
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

    let purchaseDetailsPromise: Promise<PurchaseFields | undefined> = Promise.resolve(undefined);
    if (details.purchaseId) {
      purchaseDetailsPromise = purchaseService.getPurchase(details.purchaseId);
    }
    logger.debug("fetching other info");
    const reasonListPromise = refundReasonService.getReasonList(ConfigTypeStatus.Enable);
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const refundTagsPromise = refundService.getTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([
      purchaseDetailsPromise,
      reasonListPromise,
      paymentAccountsPromise,
      refundTagsPromise,
      sharePersonsPromise,
      currencyProfilePromise
    ]);
    logger.debug("retrieved all info, now preparing response with all info to send to FC");
    const missingSharePersonsPromise = getMissingSharePersons(sharePersonsPromise, null, details);

    const response: RouteHandlerResponse<RefundDetailLoaderResource, null> = {
      type: "success",
      data: {
        refundDetail: { ...details, purchaseDetails: await purchaseDetailsPromise },
        purchaseDetail: await purchaseDetailsPromise,
        paymentAccounts: await paymentAccountsPromise,
        refundReasons: await reasonListPromise,
        refundTags: await refundTagsPromise,
        sharePersons: [...(await sharePersonsPromise), ...(await missingSharePersonsPromise)],
        currencyProfiles: await currencyProfilePromise
      }
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
    let purchaseDetailsPromise: Promise<PurchaseFields | undefined> = Promise.resolve(undefined);
    if (purchaseId && isUuid(params.purchaseId)) {
      purchaseDetailsPromise = purchaseService.getPurchase(purchaseId);
    } else if (purchaseId !== "unknown") {
      throw new InvalidError("unable to recognize purchaseId");
    }

    const reasonListPromise = refundReasonService.getReasonList(ConfigTypeStatus.Enable);
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const refundTagsPromise = refundService.getTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([
      purchaseDetailsPromise,
      reasonListPromise,
      paymentAccountsPromise,
      refundTagsPromise,
      sharePersonsPromise,
      currencyProfilePromise
    ]);

    const response: RouteHandlerResponse<RefundDetailLoaderResource, null> = {
      type: "success",
      data: {
        refundDetail: undefined,
        purchaseDetail: await purchaseDetailsPromise,
        paymentAccounts: await paymentAccountsPromise,
        refundReasons: await reasonListPromise,
        refundTags: await refundTagsPromise,
        sharePersons: await sharePersonsPromise,
        currencyProfiles: await currencyProfilePromise
      }
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
