import { json } from "react-router-dom";
import { HttpStatusCode, RouteHandlerResponse, handleRouteActionError } from "../../../../shared";
import { ErrorReceiptProps } from "./field-types";

export class ReceiptUploadError extends Error {
  public readonly name = "ReceiptUploadError";
  public readonly errorReceipts: ErrorReceiptProps[];

  constructor(errorReceipts: ErrorReceiptProps[], message?: string) {
    super(message);
    this.errorReceipts = errorReceipts;
  }

  public async getErrorMessagesOnly() {
    const promises = this.errorReceipts.map(async (er) => {
      const response = handleRouteActionError(er.error);
      if (response.status !== HttpStatusCode.Found) {
        const body = (await response.json()) as RouteHandlerResponse<null, any>;
        if (body.type === "error") {
          return body.errorMessage;
        }
      }
      return "";
    });
    const errMsgs = await Promise.all(promises);
    return errMsgs.filter((em) => em);
  }

  public getRedirectUrl() {
    const redirectUrlReceipt = this.errorReceipts.find((er) => {
      const response = handleRouteActionError(er.error);
      return response.status === HttpStatusCode.Found;
    });
    if (!redirectUrlReceipt) {
      return null;
    }
    const response = handleRouteActionError(redirectUrlReceipt.error);
    return response.headers.get("Location");
  }

  public async getRouteActionErrorResponse() {
    const redirectUrlReceipt = this.errorReceipts.find((er) => {
      const response = handleRouteActionError(er.error);
      return response.status === HttpStatusCode.Found;
    });

    if (redirectUrlReceipt) {
      return handleRouteActionError(redirectUrlReceipt.error);
    }

    const responses = this.errorReceipts.map((er) => handleRouteActionError(er.error)).filter((resp) => resp.status !== HttpStatusCode.Found);

    const statusSet = new Set<HttpStatusCode>();
    responses.forEach((resp) => statusSet.add(resp.status));
    const httpStatus = statusSet.size > 1 ? HttpStatusCode.InternalServerError : [...statusSet.values()][0];

    const messagePromises = responses.map(async (r: Response) => {
      const body = (await r.json()) as RouteHandlerResponse<null, any>;
      if (body.type === "error") {
        return body.errorMessage;
      }
      return "";
    });
    const messages = (await Promise.all(messagePromises)).filter((m) => m);
    const response: RouteHandlerResponse<null, null> = { type: "error", errorMessage: messages.join("\n"), data: null };
    return json(response, { status: httpStatus });
  }
}
