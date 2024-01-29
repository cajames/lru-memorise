import { LRU, lru } from "tiny-lru";
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
  /**
   * Optional cache passed in.
   */
  cache?: any;
  /**
   * Cache Key resolver based on arguments to function
   */
  cacheKeyResolver?: (...args: ARGS) => string;
  /**
   * Optional callback called when a cache value is hit.
   *
   * @param cacheKey The key that was hit
   * @param value The value that was returned by the cache
   * @param cache The cache
   */
  onHit?: (cacheKey: string, value: T, cache: LRU<T>) => void;

  /**
   * Options passed to internal `tiny-lru` cache that will be created.
   * Not used if `cache` is passed in.
   */
  lruOptions?: LRUOptions;
}

const defaultLRUOptions: LRUOptions = {
  max: 1000,
};

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
    onHit,
    lruOptions = {},
  } = options;

  const _cache = cache || (LRU(lruOptions.max, lruOptions.ttl) as Lru<RESULT>);

  // Cached fn
  const returnFn = (...args: ARGS): RESULT => {
    const cacheKey = cacheKeyResolver(...args);
    const cachedValue = _cache.get(cacheKey);
    const keyCached = _cache.has(cacheKey);

    // Use cached key, even if value is void
    if (keyCached) {
      // If onHit handler is there, run it
      if (onHit) {
        onHit(cacheKey, cachedValue, _cache);
      }
      return cachedValue;
    }

    // No cache hit, run function and cache result
    const result = cachedFn.apply(this, args) as RESULT;
    _cache.set(cacheKey, result);
    return result;
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
  if (args.length === 0) {
    return "no-args";
  }
  return args.map((val) => JSON.stringify(val)).join("/");
};
