import { AxiosResponse } from "axios";
import { LocalDBStore, MyLocalDatabase } from "../db";
import { getLogger, subtractDatesDefaultToZero } from "../utils";
import ms, { StringValue } from "ms";

interface ApiResponseCacheResource {
  id: string;
  belongsTo: string;
  url: string;
  queryParams: Record<string, string[]>;
  responseListSize: number;
  updatedOn: Date;
}

const db = new MyLocalDatabase<ApiResponseCacheResource>(LocalDBStore.Config);

const _logger = getLogger("service.api.response.cache", null, null, "DISABLED");

const getId = (url: string, params: Record<string, string[]> | null | undefined) => {
  return url + "_" + JSON.stringify(params || {});
};

export const updateApiResponse = (response: AxiosResponse) => {
  const logger = getLogger("updateApiResponse", _logger);
  const url = response.config.url as string;
  const params = (response.config.params || {}) as Record<string, string[]>;
  let listSize = 0;
  if (Array.isArray(response.data)) {
    listSize = response.data.length;
  }
  logger.debug("received api response, updating db record for id=", getId(url, params), "listSize=", listSize);
  db.addUpdateItem({
    id: getId(url, params),
    belongsTo: url,
    queryParams: params,
    responseListSize: listSize,
    url: url,
    updatedOn: new Date()
  });
};

const getApiResponse = async (url: string, queryParams?: Record<string, string[]> | null) => {
  return db.getItem(getId(url, queryParams));
};

interface CriteriaResource {
  /** time represents supported units by ms lib. sec, min, hour, week */
  withinTime?: StringValue;
  listSize?: number;
  minSize?: number;
}

/**
 * verify if last api call is matching criteria. This is useful in avoiding multiple  api calls since there was no result to cache
 *
 * @param criteria to match conditions of api call
 * @param url api Url
 * @param queryParams api params
 * @returns true, if api response is cached and matching given criteria. otherwise false
 */
export const isApiCalled = async (criteria: CriteriaResource, url: string, queryParams?: Record<string, string[]> | null) => {
  const logger = getLogger("isApiCalled", _logger);
  const item = (await getApiResponse(url, queryParams)) as ApiResponseCacheResource;
  let isValid = !!item;

  // by default item is considered to be valid
  if (criteria.withinTime !== undefined && isValid) {
    const durationMillis = ms(criteria.withinTime);
    const itemCacheMillis = subtractDatesDefaultToZero(null, item.updatedOn).toMilliseconds();
    if (itemCacheMillis > durationMillis) {
      isValid = false;
    }
  }

  if (criteria.listSize !== undefined && isValid) {
    if (item.responseListSize !== criteria.listSize) {
      isValid = false;
    }
  }

  if (criteria.minSize !== undefined && isValid) {
    if (item.responseListSize < criteria.minSize) {
      isValid = false;
    }
  }

  return isValid;
};
