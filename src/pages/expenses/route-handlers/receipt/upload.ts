import { ReceiptProps, ReceiptUploadError } from "../../../../components/receipt";
import { handleRouteActionError, InvalidError, LoggerBase } from "../../../../shared";
import { getLogger, receiptService } from "../../services";

export const uploadReceipts = async (receipts: ReceiptProps[], formdata: FormData, baseLogger: LoggerBase) => {
  const logger = getLogger("uploadReceipts", baseLogger);

  try {
    logger.debug("receipts without files =", receipts);
    if (!Array.isArray(receipts)) {
      throw new InvalidError("provided receipts is not list");
    }
    receipts.forEach((rct) => (rct.file = formdata.get(rct.id) as File));
    logger.debug(
      "receipt files to upload =",
      receipts.map((r) => r.file).filter((f) => f)
    );
    const modifiedReceipts = await receiptService.uploadReceipts(receipts);
    return modifiedReceipts;
  } catch (e) {
    if (e instanceof ReceiptUploadError) {
      const errorResponse = await e.getRouteActionErrorResponse();
      logger.debug("errorResponse =", await e.getErrorMessagesOnly());
      return errorResponse;
    }
    return handleRouteActionError(e);
  }
};
