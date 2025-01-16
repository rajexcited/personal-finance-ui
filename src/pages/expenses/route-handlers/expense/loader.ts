import { SharePersonResource, sharePersonService } from "../../../settings/services";
import { ExpenseFields, expenseService, getLogger, handleRouteActionError, RouteHandlerResponse } from "../../services";
import { getMissingSharePersons } from "../common";
import { getLoadMoreMonths } from "./share-list";

const rhLogger = getLogger("route.handler.expense.loader", null, null, "DISABLED");

export interface ExpenseListLoaderResource {
  expenseList: ExpenseFields[];
  sharePersons: SharePersonResource[];
}
export const expenseListLoaderHandler = async () => {
  const logger = getLogger("expenseListLoaderHandler", rhLogger);
  try {
    const params = getLoadMoreMonths();
    const expenseListPromise = expenseService.getExpenseList(params.pageNo, params.status, params.months);
    const sharePersonsPromise = sharePersonService.getSharePersonList();
    await Promise.all([expenseListPromise, sharePersonsPromise]);
    const missingSharePersonsPromise = getMissingSharePersons(sharePersonsPromise, expenseListPromise, null);
    const response: RouteHandlerResponse<ExpenseListLoaderResource, null> = {
      type: "success",
      data: {
        expenseList: await expenseListPromise,
        sharePersons: [...(await sharePersonsPromise), ...(await missingSharePersonsPromise)]
      }
    };
    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};
