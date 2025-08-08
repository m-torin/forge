/**
 * Tests for cache utilities
 */
import { afterEach, beforeEach, describe, expect } from 'vitest';
import { BoundedCache, CacheRegistry, globalCacheRegistry } from '../../src/utils/cache';

describe('boundedCache', () => {
  let cache: BoundedCache;

  beforeEach(() => {
    cache = new BoundedCache({
      maxSize: 3,
      ttl: 1000, // 1 second
      enableAnalytics: true,
    });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('basic operations', () => {
    test('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBeTruthy();
      expect(cache.has('nonexistent')).toBeFalsy();
    });

    test('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBeTruthy();

      const deleted = cache.delete('key1');
      expect(deleted).toBeTruthy();
      expect(cache.has('key1')).toBeFalsy();
    });

    test('should return false when deleting non-existent key', () => {
      const deleted = cache.delete('nonexistent');
      expect(deleted).toBeFalsy();
    });

    test('should get size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    test('should get keys array', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const keys = cache.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    test('should get values array', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const values = cache.values();
      expect(values).toContain('value1');
      expect(values).toContain('value2');
      expect(values).toHaveLength(2);
    });

    test('should get entries array', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const entries = cache.entries();
      expect(entries).toContainEqual(['key1', 'value1']);
      expect(entries).toContainEqual(['key2', 'value2']);
      expect(entries).toHaveLength(2);
    });
  });

  describe('lRU eviction', () => {
    test('should evict oldest item when max size exceeded', () => {
      // Fill to capacity
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size()).toBe(3);
      expect(cache.has('key1')).toBeTruthy();

      // Add one more - should evict key1
      cache.set('key4', 'value4');

      expect(cache.size()).toBe(3);
      expect(cache.has('key1')).toBeFalsy();
      expect(cache.has('key4')).toBeTruthy();
    });

    test('should update LRU order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Access key1 to make it most recently used
      cache.get('key1');

      // Add key4 - should evict key2 (oldest)
      cache.set('key4', 'value4');

      expect(cache.has('key1')).toBeTruthy(); // Was accessed recently
      expect(cache.has('key2')).toBeFalsy(); // Should be evicted
      expect(cache.has('key3')).toBeTruthy();
      expect(cache.has('key4')).toBeTruthy();
    });
  });

  describe('tTL expiration', () => {
    test('should expire items after TTL', async () => {
      const shortTtlCache = new BoundedCache({ ttl: 50 }); // 50ms

      shortTtlCache.set('key1', 'value1');
      expect(shortTtlCache.get('key1')).toBe('value1');

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(shortTtlCache.get('key1')).toBeUndefined();
      expect(shortTtlCache.has('key1')).toBeFalsy();
    });

    test('should clear expired items automatically', async () => {
      const shortTtlCache = new BoundedCache({ ttl: 50 });

      shortTtlCache.set('key1', 'value1');
      expect(shortTtlCache.size()).toBe(1);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Accessing should clean up expired item
      shortTtlCache.get('key1');
      expect(shortTtlCache.size()).toBe(0);
    });
  });

  describe('analytics', () => {
    test('should track hits and misses', () => {
      cache.set('key1', 'value1');

      // Hit
      cache.get('key1');
      // Miss
      cache.get('nonexistent');

      const analytics = cache.getAnalytics();
      expect(analytics.hits).toBe(1);
      expect(analytics.misses).toBe(1);
      expect(analytics.hitRate).toBe('50.00%');
    });

    test('should track sets, deletes, and evictions', () => {
      // Fill to capacity
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // This should cause an eviction
      cache.set('key4', 'value4');

      // Delete a key
      cache.delete('key2');

      const analytics = cache.getAnalytics();
      expect(analytics.sets).toBe(4);
      expect(analytics.evictions).toBe(1);
      expect(analytics.deletes).toBe(1);
    });

    test('should export state for debugging', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const state = cache.exportState();

      expect(state.config.maxSize).toBe(3);
      expect(state.config.ttl).toBe(1000);
      expect(state.state.size).toBe(2);
      expect(state.state.keys).toContain('key1');
      expect(state.state.keys).toContain('key2');
      expect(state.analytics.currentSize).toBe(2);
    });
  });

  describe('cleanup and memory management', () => {
    test('should cleanup cache when forced', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.size()).toBe(2);

      const result = cache.cleanup(true);

      expect(result.cleaned).toBeTruthy();
      expect(result.sizeBefore).toBe(2);
      expect(result.sizeAfter).toBe(0);
      expect(cache.size()).toBe(0);
    });

    test('should clear all items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size()).toBe(3);

      cache.clear();

      expect(cache.size()).toBe(0);
      expect(cache.keys()).toHaveLength(0);
    });
  });
});

describe('cacheRegistry', () => {
  let registry: CacheRegistry;

  beforeEach(() => {
    registry = new CacheRegistry();
  });

  afterEach(() => {
    // Clean up all caches
    const cacheNames = registry.list();
    cacheNames.forEach(name => registry.delete(name));
  });

  test('should create and retrieve caches', () => {
    const cache1 = registry.create('test-cache', { maxSize: 10 });
    const cache2 = registry.get('test-cache');

    expect(cache1).toBe(cache2);
    expect(cache1).toBeInstanceOf(BoundedCache);
  });

  test('should return same cache for duplicate creates', () => {
    const cache1 = registry.create('test-cache', { maxSize: 5 });
    const cache2 = registry.create('test-cache', { maxSize: 10 });

    expect(cache1).toBe(cache2);
  });

  test('should return undefined for non-existent cache', () => {
    const cache = registry.get('nonexistent');
    expect(cache).toBeUndefined();
  });

  test('should list cache names', () => {
    registry.create('cache1');
    registry.create('cache2');
    registry.create('cache3');

    const names = registry.list();
    expect(names).toContain('cache1');
    expect(names).toContain('cache2');
    expect(names).toContain('cache3');
    expect(names).toHaveLength(3);
  });

  test('should delete caches', () => {
    const cache = registry.create('test-cache');
    cache.set('key1', 'value1');

    expect(registry.get('test-cache')).toBeDefined();

    const deleted = registry.delete('test-cache');

    expect(deleted).toBeTruthy();
    expect(registry.get('test-cache')).toBeUndefined();
  });

  test('should return false when deleting non-existent cache', () => {
    const deleted = registry.delete('nonexistent');
    expect(deleted).toBeFalsy();
  });

  test('should cleanup all caches', () => {
    const cache1 = registry.create('cache1');
    const cache2 = registry.create('cache2');

    cache1.set('key1', 'value1');
    cache2.set('key2', 'value2');

    const results = registry.cleanupAll();

    expect(results.cache1.cleaned).toBeTruthy();
    expect(results.cache2.cleaned).toBeTruthy();
    expect(cache1.size()).toBe(0);
    expect(cache2.size()).toBe(0);
  });

  test('should get global analytics', () => {
    const cache1 = registry.create('cache1', { enableAnalytics: true });
    const cache2 = registry.create('cache2', { enableAnalytics: true });

    cache1.set('key1', 'value1');
    cache2.set('key2', 'value2');

    cache1.get('key1'); // hit
    cache1.get('missing'); // miss

    const analytics = registry.getGlobalAnalytics();

    expect(analytics.cache1).toBeDefined();
    expect(analytics.cache2).toBeDefined();
    expect(analytics.cache1.hits).toBe(1);
    expect(analytics.cache1.misses).toBe(1);
  });
});

describe('globalCacheRegistry', () => {
  afterEach(() => {
    // Clean up global registry
    const cacheNames = globalCacheRegistry.list();
    cacheNames.forEach(name => globalCacheRegistry.delete(name));
  });

  test('should be a singleton instance', () => {
    const cache1 = globalCacheRegistry.create('test-cache');
    const cache2 = globalCacheRegistry.get('test-cache');

    expect(cache1).toBe(cache2);
  });

  test('should persist across imports', async () => {
    globalCacheRegistry.create('persistent-cache');

    // Simulate different import/module
    const { globalCacheRegistry: importedRegistry } = await import('../../src/utils/cache');

    expect(importedRegistry.get('persistent-cache')).toBeDefined();
  });
});
