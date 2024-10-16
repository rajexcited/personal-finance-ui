import { authService } from "../../auth";
import { getLogger, handleRouteActionError, RouteHandlerResponse, statService } from "../services";
import { StatsExpenseResource } from "../services/field-types";

const rhLogger = getLogger("route.handler.home.loader", null, null, "DEBUG");

export interface HomepageDetailLoaderResource {
  stats: StatsExpenseResource[];
}

export const homepageDetailsLoaderHandler = async () => {
  const logger = getLogger("homepageDetailsLoaderHandler", rhLogger);
  try {
    let response: RouteHandlerResponse<HomepageDetailLoaderResource, null>;
    if (authService.isAuthenticated(logger)) {
      const currentYear = String(new Date().getFullYear());
      const purchaseStatsPromise = statService.getPurchaseStats(currentYear);
      const refundStatsPromise = statService.getRefundStats(currentYear);
      const incomeStatsPromise = statService.getIncomeStats(currentYear);
      await Promise.all([purchaseStatsPromise, refundStatsPromise, incomeStatsPromise]);

      logger.debug("retrieved all 3 stats");
      response = {
        type: "success",
        data: {
          stats: [await purchaseStatsPromise, await refundStatsPromise, await incomeStatsPromise],
        },
      };
    } else {
      logger.debug("since user is not authenticated, cannot retrieve any stats");
      response = {
        type: "success",
        data: {
          stats: [],
        },
      };
    }
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
