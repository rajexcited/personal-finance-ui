export { MyLocalDatabase, LocalDBStore, LocalDBStoreIndex } from "./db";

export type { AuditFields } from "./audit-fields";
export { convertAuditFieldsToDateInstance } from "./audit-fields";

export { ascCompare, descCompare } from "./comparator";

export {
  handleRestErrors,
  isBlank,
  formatTimestamp,
  parseTimestamp,
  HttpStatusCode,
  handleRouteActionError,
  NotFoundError,
  UnauthorizedError,
  subtractDates,
} from "./utils";

export type { RouteHandlerResponse } from "./utils";

export type { ConfigResource, UpdateConfigStatusResource } from "./config-type-service";
export { default as ConfigTypeService, ConfigTypeStatus, ConfigTypeBelongsTo } from "./config-type-service";

export { default as axios } from "./axios-proxy";
export { default as difference } from "./difference";

export { LoggerBase, getLogger } from "./logger";
