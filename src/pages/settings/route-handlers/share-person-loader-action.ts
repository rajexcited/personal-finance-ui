import { ActionFunctionArgs } from "react-router";
import {
  DeleteSharePersonResource,
  HttpStatusCode,
  RouteHandlerResponse,
  SharePersonResource,
  UpdateSharePersonResource,
  UpdateSharePersonStatusResource,
  getLogger,
  handleRouteActionError,
  sharePersonService
} from "../services";
import { responseJson } from "../../../shared";

const rhLogger = getLogger("route.handler.settings.sharePerson.loader", null, null, "DISABLED");

export interface SharePersonLoaderResource {
  sharePersons: SharePersonResource[];
  tags: string[];
}

export const sharePersonListLoaderHandler = async () => {
  const logger = getLogger("sharePersonListLoaderHandler", rhLogger);
  try {
    const sharePersonList = await sharePersonService.getSharePersonList();
    const allTags = await sharePersonService.getTagList();

    const response: RouteHandlerResponse<SharePersonLoaderResource, null> = {
      type: "success",
      data: { sharePersons: sharePersonList, tags: allTags }
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
        method: request.method
      }
    }
  };
  return responseJson(error, HttpStatusCode.InternalServerError);
};

const sharePersonAddUpdateActionHandler = async (request: Request) => {
  const logger = getLogger("sharePersonAddUpdateActionHandler", rhLogger);
  const data = (await request.json()) as UpdateSharePersonResource | UpdateSharePersonStatusResource;

  try {
    if (data.action === "addUpdateDetails") {
      logger.debug("before calling addUpdate, data=", data);
      await sharePersonService.addUpdateSharePerson(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: "share person updated"
      };
      return response;
    }

    if (data.action === "updateStatus") {
      await sharePersonService.updateSharePersonStatus(data);
      const response: RouteHandlerResponse<string, null> = {
        type: "success",
        data: `share person status is updated to ${data.status}`
      };
      return response;
    }

    const error: RouteHandlerResponse<null, any> = {
      type: "error",
      errorMessage: "structure of data not supported for updating share person",
      data: {
        request: {
          method: request.method,
          data: data
        }
      }
    };
    return responseJson(error, HttpStatusCode.InternalServerError);
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
      data: "share person is deleted"
    };
    return response;
  } catch (e) {
    logger.error("in action handler", e);
    return handleRouteActionError(e);
  }
};
