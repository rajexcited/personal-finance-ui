import { getLogger, subtractDatesDefaultToZero } from "../../../../shared";
import { ExpenseStatus } from "../../services";

const loadMoreMonthsProps = {
  initialMonths: 6,
  defaultMonths: 3,
  pageNo: 1,
  status: ExpenseStatus.Enable,
  createdOn: new Date(),
  updatedOn: new Date()
};

const rootLogger = getLogger("route.handler.expense.list.loader.action.sharing", null, null, "DISABLED");

const resetLoadMoreMonths = () => {
  const logger = getLogger("resetLoadMoreMonths", rootLogger);
  loadMoreMonthsProps.pageNo = 1;
  loadMoreMonthsProps.updatedOn = new Date();
  logger.debug("updated pageNo to initial value 1");
};

export const incrementPageNoToLoadMoreMonths = () => {
  const logger = getLogger("incrementPageNoToLoadMoreMonths", rootLogger);
  loadMoreMonthsProps.pageNo++;
  loadMoreMonthsProps.updatedOn = new Date();
  logger.debug("incremented pageNo to", loadMoreMonthsProps.pageNo);
};

export const getLoadMoreMonths = () => {
  const logger = getLogger("getLoadMoreMonths", rootLogger);
  if (subtractDatesDefaultToZero(null, loadMoreMonthsProps.updatedOn).toMilliseconds().value > 500) {
    logger.debug("the time diff of last updated is out of range (>500 millis)");
    resetLoadMoreMonths();
  }
  const res = {
    months: loadMoreMonthsProps.pageNo > 1 ? loadMoreMonthsProps.defaultMonths : loadMoreMonthsProps.initialMonths,
    pageNo: loadMoreMonthsProps.pageNo,
    status: loadMoreMonthsProps.status
  };
  logger.debug("responding with", res, "to get list of expenses");
  return res;
};
