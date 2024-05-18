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
  get: <T>(key: string): T => {
    const result = localStorage.getItem(key);

    if (!result) {
      throw new Error(`Cannot access localStorage item - ${key}`);
    }

    const { value, expiration, storedAt } = JSON.parse(result) as CacheItem;

    if (Date.now() - storedAt >= expiration) {
      console.warn(`LocalStorageCache item is expired - ${key}`);
      localStorage.removeItem(key);
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
