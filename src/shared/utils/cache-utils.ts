import ExpiryMap from "expiry-map";
import { memoize } from "lodash";
import ms, { StringValue } from "ms";

export const getCacheOption = (expiryAge: StringValue) => {
  return { cache: new ExpiryMap(ms(expiryAge)), cacheKey: JSON.stringify };
};

export const getCacheOptionWithKey = (expiryAge: StringValue, cachekey: string) => {
  return { cache: new ExpiryMap(ms(expiryAge)), cacheKey: () => cachekey };
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

export function pMemoizeSyncClear(fn: AnySyncFunction) {
  const mfn = fn as unknown as any;
  const cache = mfn.cache as ExpiryMap;
  if (cache && typeof cache.clear === "function") {
    cache.clear();
  }
}
