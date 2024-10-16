import ExpiryMap from "expiry-map";
import { memoize } from "lodash";
import ms from "ms";

export const getCacheOption = (expiryAge: string) => {
  return { cache: new ExpiryMap(ms(expiryAge)), cacheKey: JSON.stringify };
};

type AnySyncFunction = (...arguments_: any[]) => unknown | void;

type Options<FunctionToMemoize extends AnySyncFunction, CacheKeyType> = {
  readonly cacheKey?: (...arguments_: Parameters<FunctionToMemoize>) => CacheKeyType;
  readonly cache?: ExpiryMap<CacheKeyType, ReturnType<FunctionToMemoize>> | false;
};

export function pMemoizeSync<FunctionToMemoize extends AnySyncFunction, CacheKeyType>(
  fn: FunctionToMemoize,
  cacheOptions?: Options<FunctionToMemoize, CacheKeyType>
): FunctionToMemoize {
  const memoizedFn = memoize(fn, cacheOptions?.cacheKey);

  if (cacheOptions?.cache) {
    memoizedFn.cache = cacheOptions.cache;
  }

  return memoizedFn;
}
