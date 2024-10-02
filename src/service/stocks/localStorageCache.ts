interface CacheItem {
  value: unknown;
  storedAt: number;
  expiration: number;
}

const ONE_DAY_AHEAD = 60 * 1000 * 60 * 24;

export const localStorageCache = {
  exists: (key: string) => {
    return !!localStorage.getItem(key);
  },
  get: <T>(key: string): T | undefined => {
    const result = localStorage.getItem(key);

    if (!result) {
      throw new Error(`Cannot access localStorage item - ${key}`);
    }

    const { value, expiration, storedAt } = JSON.parse(result) as CacheItem;

    if (Date.now() - storedAt >= expiration) {
      console.warn(`LocalStorageCache item is expired - ${key}`);
      localStorage.removeItem(key);
      return undefined;
    }

    return value as T;
  },

  set: (
    key: string,
    value: object,
    expiration: number = Date.now() + ONE_DAY_AHEAD
  ) => {
    const cacheItem = {
      value,
      storedAt: Date.now(),
      expiration,
    };

    localStorage.setItem(key, JSON.stringify(cacheItem));
  },
};

type CacheKeyFunction<
  T extends (...args: never) => Promise<Awaited<ReturnType<T>>>
> = (...args: Parameters<T>) => string;
type CacheKey<T extends (...args: never) => Promise<Awaited<ReturnType<T>>>> =
  | string
  | CacheKeyFunction<T>;

export const cachedOperation = <
  T extends (...args: never[]) => Promise<Awaited<ReturnType<T>>>
>(
  fn: T,
  key: CacheKey<T>,
  expiration?: number
): ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) => {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const keyValue = typeof key === 'string' ? key : key(...args);

    const existing = localStorageCache.get<ReturnType<T>>(keyValue);
    if (existing) {
      return Promise.resolve(existing);
    }

    const result = await fn(...args);

    localStorageCache.set(keyValue, result, expiration);

    return result;
  };
};
