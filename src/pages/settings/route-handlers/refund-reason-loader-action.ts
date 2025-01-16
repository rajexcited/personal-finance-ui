import { ActionFunctionArgs, json } from "react-router-dom";
import {
  ConfigResource,
  DeleteConfigDetailsResource,
  HttpStatusCode,
  RouteHandlerResponse,
  UpdateConfigDetailsResource,
  UpdateConfigStatusResource,
  getLogger,
  handleRouteActionError,
} from "../services";
import { refundReasonService } from "../../expenses/services";

const rhLogger = getLogger("route.handler.settings.refundReason.loader", null, null, "DISABLED");

export interface RefundReasonLoaderResource {
  refundReasons: ConfigResource[];
  reasonTags: string[];
}

export const refundReasonListLoaderHandler = async () => {
  const logger = getLogger("refundReasonListLoaderHandler", rhLogger);
  try {
    const reasonList = await refundReasonService.getReasonList();
    const reasonTags = await refundReasonService.getTagList();

    const response: RouteHandlerResponse<RefundReasonLoaderResource, null> = {
      type: "success",
      data: {
        refundReasons: reasonList,
        reasonTags: reasonTags,
      },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const refundReasonListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await refundReasonAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await refundReasonDeleteActionHandler(request);
  }
  const error: RouteHandlerResponse<null, any> = {
    type: "error",
    errorMessage: "action not supported",
    data: {
      request: {
        method: request.method,
      },
    },
  };
  return json(error, { status: HttpStatusCode.InternalServerError });
};

const refundReasonAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("refundReasonAddUpdateActionHandler", rhLogger);
  const data = (await request.json()) as UpdateConfigDetailsResource | UpdateConfigStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      await refundReasonService.addUpdateReason(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "refund reason updated",
      };
      return response;
    }
    if (data.action === "updateStatus") {
      await refundReasonService.updateStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `refund reason status is updated to ${data.status}`,
      };
      return response;
    }
    const error: RouteHandlerResponse<null, any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating refund reason",
      data: {
        request: {
          method: request.method,
          data: data,
        },
      },
    };
    return json(error, { status: HttpStatusCode.InternalServerError });
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};

const refundReasonDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("refundReasonDeleteActionHandler", rhLogger);
  const data = (await request.json()) as DeleteConfigDetailsResource;

  try {
    await refundReasonService.deleteReason(data);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: `refund reason is deleted`,
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
