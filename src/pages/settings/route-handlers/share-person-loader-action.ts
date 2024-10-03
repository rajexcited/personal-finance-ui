import { ActionFunctionArgs, json } from "react-router-dom";
import {
  DeleteSharePersonResource,
  HttpStatusCode,
  RouteHandlerResponse,
  SharePersonResource,
  UpdateSharePersonResource,
  UpdateSharePersonStatusResource,
  getLogger,
  handleRouteActionError,
  sharePersonService,
} from "../services";

const rhLogger = getLogger("route.handler.settings.sharePerson.loader", null, null, "DEBUG");

export interface SharePersonLoaderResource {
  sharePersons: SharePersonResource[];
}

export const sharePersonListLoaderHandler = async () => {
  const logger = getLogger("sharePersonListLoaderHandler", rhLogger);
  try {
    const sharePersonList = await sharePersonService.getSharePersonList();

    const response: RouteHandlerResponse<SharePersonLoaderResource, null> = {
      type: "success",
      data: { sharePersons: sharePersonList },
    };

    return response;
  } catch (e) {
    logger.error("in loader handler", e);
    return handleRouteActionError(e);
  }
};

export const sharePersonListActionHandler = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return await sharePersonAddUpdateActionHandler(request);
  } else if (request.method === "DELETE") {
    return await sharePersonDeleteActionHandler(request);
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

const sharePersonAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("sharePersonAddUpdateActionHandler", rhLogger);
  const data = (await request.json()) as UpdateSharePersonResource | UpdateSharePersonStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      await sharePersonService.addUpdateSharePerson(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "share person updated",
      };
      return response;
    }

    if (data.action === "updateStatus") {
      await sharePersonService.updateSharePersonStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `share person status is updated to ${data.status}`,
      };
      return response;
    }

    const error: RouteHandlerResponse<null, any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating share person",
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

const sharePersonDeleteActionHandler = async (request: Request) => {
  const logger = getLogger("sharePersonDeleteActionHandler", rhLogger);
  const data = (await request.json()) as DeleteSharePersonResource;

  try {
    await sharePersonService.deleteSharePerson(data.id);
    const response: RouteHandlerResponse<string, null> = {
      type: "success",
      data: "share person is deleted",
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
