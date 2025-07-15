// Next.js Cache and Revalidation mocks
import { vi } from 'vitest';

// Next.js Enhanced Cache Mock for Next.js 15
vi.mock('next/cache', () => {
  // Create a mock cache store
  const mockCacheStore = new Map<string, { data: any; timestamp: number; tags: string[] }>();

  // Enhanced unstable_cache mock that handles the incrementalCache context
  const mockUnstableCache = vi.fn((fn, keys = [], options = {}) => {
    const cacheKey = Array.isArray(keys) ? keys.join(':') : keys;
    const { tags = [], revalidate } = options;

    return async (...args: any[]) => {
      const fullKey = `${cacheKey}:${JSON.stringify(args)}`;
      const cached = mockCacheStore.get(fullKey);

      // Check if cache is valid
      if (cached && revalidate) {
        const isExpired = Date.now() - cached.timestamp > revalidate * 1000;
        if (!isExpired) {
          return cached.data;
        }
      } else if (cached && !revalidate) {
        return cached.data;
      }

      // Execute function and cache result
      const result = await fn(...args);
      mockCacheStore.set(fullKey, {
        data: result,
        timestamp: Date.now(),
        tags: tags,
      });

      return result;
    };
  });

  // Enhanced revalidateTag mock that handles static generation store context
  const mockRevalidateTag = vi.fn((tag: string) => {
    // Invalidate all cache entries with this tag
    for (const [key, cached] of mockCacheStore.entries()) {
      if (cached.tags.includes(tag)) {
        mockCacheStore.delete(key);
      }
    }
    return Promise.resolve();
  });

  // Enhanced revalidatePath mock that handles static generation store context
  const mockRevalidatePath = vi.fn((path: string, type: 'page' | 'layout' = 'page') => {
    // Invalidate cache entries related to this path
    for (const [key] of mockCacheStore.entries()) {
      if (key.includes(path)) {
        mockCacheStore.delete(key);
      }
    }
    return Promise.resolve();
  });

  return {
    unstable_cache: mockUnstableCache,
    revalidateTag: mockRevalidateTag,
    revalidatePath: mockRevalidatePath,
    // Add React cache function mock
    cache: vi.fn(fn => fn),
    // Add unstable_noStore mock
    unstable_noStore: vi.fn(),
    // Mock cache store for testing
    _mockCacheStore: mockCacheStore,
  };
});

// Next.js Dynamic Rendering APIs
vi.mock('next/dist/server/web/spec-extension/unstable-cache', () => ({
  unstable_cache: vi.fn((fn, keys, options) => {
    // Return a function that directly calls the original function
    return async (...args: any[]) => {
      return await fn(...args);
    };
  }),
}));
