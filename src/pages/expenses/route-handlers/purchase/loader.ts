import { LoaderFunctionArgs } from "react-router-dom";
import {
  ConfigResource,
  purchaseService,
  getLogger,
  RouteHandlerResponse,
  NotFoundError,
  handleRouteActionError,
  PurchaseFields,
} from "../../services";
import { PymtAccountFields, pymtAccountService } from "../../../pymt-accounts/services";
import {
  ConfigTypeStatus,
  CurrencyProfileResource,
  currencyProfileService,
  SharePersonResource,
  sharePersonService,
} from "../../../settings/services";

const rhLogger = getLogger("route.handler.purchase.loader", null, null, "DISABLED");

export interface PurchaseDetailLoaderResource {
  purchaseDetail?: PurchaseFields;
  paymentAccounts: PymtAccountFields[];
  purchaseTypes: ConfigResource[];
  purchaseTags: string[];
  sharePersons: SharePersonResource[];
  currencyProfiles: CurrencyProfileResource[];
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
    const purchaseTypesPromise = purchaseService.getPurchaseTypes();
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const purchaseTagsPromise = purchaseService.getPurchaseTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([purchaseTypesPromise, paymentAccountsPromise, purchaseTagsPromise, sharePersonsPromise, currencyProfilePromise]);
    logger.debug("retrieved all info, now preparing response with all info to send to FC");

    const response: RouteHandlerResponse<PurchaseDetailLoaderResource, null> = {
      type: "success",
      data: {
        purchaseDetail: details,
        paymentAccounts: await paymentAccountsPromise,
        purchaseTypes: await purchaseTypesPromise,
        purchaseTags: await purchaseTagsPromise,
        sharePersons: await sharePersonsPromise,
        currencyProfiles: await currencyProfilePromise,
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
    const purchaseTypesPromise = purchaseService.getPurchaseTypes();
    const paymentAccountsPromise = pymtAccountService.getPymtAccountList();
    const purchaseTagsPromise = purchaseService.getPurchaseTags();
    const sharePersonsPromise = sharePersonService.getSharePersonList(ConfigTypeStatus.Enable);
    const currencyProfilePromise = currencyProfileService.getCurrencyProfiles();

    await Promise.all([purchaseTypesPromise, paymentAccountsPromise, purchaseTagsPromise, sharePersonsPromise, currencyProfilePromise]);
    const response: RouteHandlerResponse<PurchaseDetailLoaderResource, null> = {
      type: "success",
      data: {
        paymentAccounts: await paymentAccountsPromise,
        purchaseTypes: await purchaseTypesPromise,
        purchaseTags: await purchaseTagsPromise,
        sharePersons: await sharePersonsPromise,
        currencyProfiles: await currencyProfilePromise,
      },
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
