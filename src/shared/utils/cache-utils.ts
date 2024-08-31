import ExpiryMap from "expiry-map";
import ms from "ms";

export const getCacheOption = (expiryAge: string) => {
  return { cache: new ExpiryMap(ms(expiryAge)), cacheKey: JSON.stringify };
};
