import LRU, { Lru } from "tiny-lru";
export interface LRUOptions {
  /**
   * Max number of items in LRU cache
   * @default 1000
   */
  max?: number;
  /**
   * Expiry of items in cache
   * @default undefined
   */
  ttl?: number;
}
export interface MemorisedOptions<
  T extends any = any,
  ARGS extends any[] = any[]
> {
  cache?: Lru<T>;
  cacheKeyResolver?: (...args: ARGS) => string;
  lruOptions?: LRUOptions;
}

/**
 * Returns a memorised version of the target function.
 * The cache key depends on the arguments passed to the function.
 *
 * Pass in options to customise the caching behaviour
 * @param cachedFn Function to cache
 * @param options Memorization and LRUCache Options
 */
export const memorise = <RESULT extends any = any, ARGS extends any[] = any[]>(
  cachedFn: (...args: ARGS) => RESULT,
  options: MemorisedOptions<RESULT, ARGS> = {}
) => {
  // Extract defaults
  const {
    cache,
    cacheKeyResolver = defaultGenCacheKey,
    lruOptions = {
      max: 1000,
    },
  } = options;

  const _cache = cache || (LRU(lruOptions.max, lruOptions.ttl) as Lru<RESULT>);

  // Cached fn
  const returnFn = (...args: ARGS): RESULT => {
    const cacheKey = cacheKeyResolver(...args);
    const cachedValue = _cache.get(cacheKey);

    if (cachedValue) {
      return cachedValue;
    } else {
      const result = cachedFn.apply(this, args) as RESULT;
      _cache.set(cacheKey, result);
      return result;
    }
  };

  // Expose the cache
  returnFn._cache = _cache;
  return returnFn;
};

// Default export
export default memorise;

/**
 * Generic args handler function.
 * @param args Argument array
 */
const defaultGenCacheKey = (...args: any[]) => {
  return args.map((val) => JSON.stringify(val)).join("/");
};
