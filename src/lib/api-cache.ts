// High-Performance In-Memory API Request Deduplication & Cache Layer
// Prevents duplicate concurrent HTTP requests and redundant network waterfalls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 20_000; // 20 seconds short-term cache

/**
 * Fetch data with automatic in-flight deduplication and short-term memory caching.
 * If 3 components request '/api/memories' at the same time, only 1 network request is made.
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: {
    maxAgeMs?: number;
    forceRefresh?: boolean;
    fetchOptions?: RequestInit;
  }
): Promise<T> {
  const maxAgeMs = options?.maxAgeMs ?? DEFAULT_TTL_MS;
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  // 1. Return from memory cache if fresh and not forced to refresh
  if (!forceRefresh) {
    const cached = cacheStore.get(url);
    if (cached && now - cached.timestamp < maxAgeMs) {
      return cached.data;
    }
  }

  // 2. In-flight request deduplication: if identical URL request is already pending, join it!
  const pending = inFlightRequests.get(url);
  if (pending) {
    return pending;
  }

  // 3. Initiate the network request
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...(options?.fetchOptions || {}),
        cache: 'no-cache', // allow fresh server fetch but obey ETags
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store in memory cache
      cacheStore.set(url, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } finally {
      // Clean up in-flight tracker
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, requestPromise);
  return requestPromise;
}

/**
 * Explicitly invalidate cache when data is modified (added, edited, deleted)
 */
export function invalidateApiCache(urlPattern?: string) {
  if (!urlPattern) {
    cacheStore.clear();
    return;
  }

  for (const key of cacheStore.keys()) {
    if (key.includes(urlPattern)) {
      cacheStore.delete(key);
    }
  }
}
