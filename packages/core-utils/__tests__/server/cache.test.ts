import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BoundedCache, CacheRegistry, globalCacheRegistry } from '../../src/server/cache';

describe('server/cache', () => {
  describe('BoundedCache', () => {
    let cache: BoundedCache;

    beforeEach(() => {
      cache = new BoundedCache({ maxSize: 3, ttl: 1000, enableAnalytics: true });
    });

    it('stores and retrieves values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('returns undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('deletes keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('clears all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('evicts entries when max size is reached', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.size()).toBe(3);

      // Adding 4th item should evict the oldest
      cache.set('key4', 'value4');
      expect(cache.size()).toBe(3);
      expect(cache.get('key1')).toBeUndefined(); // Should be evicted
      expect(cache.get('key4')).toBe('value4');
    });

    it('respects TTL', async () => {
      const shortTtlCache = new BoundedCache({ ttl: 50 });
      shortTtlCache.set('key1', 'value1');
      expect(shortTtlCache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(shortTtlCache.get('key1')).toBeUndefined();
    });

    it('provides cache keys, values, and entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      expect(cache.keys()).toEqual(['key1', 'key2']);
      expect(cache.values()).toEqual(['value1', 'value2']);
      expect(cache.entries()).toEqual([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);
    });

    it('tracks analytics when enabled', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss
      cache.delete('key1');

      const analytics = cache.getAnalytics();
      expect(analytics.hits).toBe(1);
      expect(analytics.misses).toBe(1);
      expect(analytics.sets).toBe(1);
      expect(analytics.deletes).toBe(1);
      expect(analytics.hitRate).toBe('50.00%');
    });

    it('provides export state for debugging', () => {
      cache.set('key1', 'value1');
      const state = cache.exportState();

      expect(state.config.maxSize).toBe(3);
      expect(state.config.ttl).toBe(1000);
      expect(state.config.enableAnalytics).toBe(true);
      expect(state.state.size).toBe(1);
      expect(state.state.keys).toEqual(['key1']);
      expect(state.analytics.currentSize).toBe(1);
    });

    it('performs cleanup based on memory pressure', () => {
      // Mock process.memoryUsage to simulate high memory usage
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 200 * 1024 * 1024, // 200MB
        heapTotal: 300 * 1024 * 1024,
        external: 0,
        arrayBuffers: 0,
        rss: 250 * 1024 * 1024,
      });

      cache.set('key1', 'value1');
      const result = cache.cleanup();

      expect(result.cleaned).toBe(true);
      expect(result.sizeBefore).toBe(1);
      expect(result.sizeAfter).toBe(0);

      process.memoryUsage = originalMemoryUsage;
    });

    it('skips cleanup when memory pressure is low', () => {
      cache.set('key1', 'value1');
      const result = cache.cleanup();

      expect(result.cleaned).toBe(false);
      expect(result.reason).toBe('No memory pressure detected');
    });

    it('forces cleanup when requested', () => {
      cache.set('key1', 'value1');
      const result = cache.cleanup(true);

      expect(result.cleaned).toBe(true);
      expect(cache.size()).toBe(0);
    });
  });

  describe('CacheRegistry', () => {
    let registry: CacheRegistry;

    beforeEach(() => {
      registry = new CacheRegistry();
    });

    it('creates and retrieves caches', () => {
      const cache1 = registry.create('cache1', { maxSize: 5 });
      const cache2 = registry.get('cache1');

      expect(cache1).toBe(cache2);
      expect(cache1).toBeInstanceOf(BoundedCache);
    });

    it('returns same instance for duplicate create calls', () => {
      const cache1 = registry.create('cache1');
      const cache2 = registry.create('cache1');

      expect(cache1).toBe(cache2);
    });

    it('returns undefined for non-existent caches', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
    });

    it('deletes caches', () => {
      registry.create('cache1');
      expect(registry.delete('cache1')).toBe(true);
      expect(registry.get('cache1')).toBeUndefined();
      expect(registry.delete('nonexistent')).toBe(false);
    });

    it('lists cache names', () => {
      registry.create('cache1');
      registry.create('cache2');

      expect(registry.list().sort()).toEqual(['cache1', 'cache2']);
    });

    it('cleans up all caches', () => {
      const cache1 = registry.create('cache1');
      const cache2 = registry.create('cache2');

      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');

      const results = registry.cleanupAll();

      expect(results.cache1.cleaned).toBe(true);
      expect(results.cache2.cleaned).toBe(true);
      expect(cache1.size()).toBe(0);
      expect(cache2.size()).toBe(0);
    });

    it('provides global analytics', () => {
      const cache1 = registry.create('cache1', { enableAnalytics: true });
      const cache2 = registry.create('cache2', { enableAnalytics: true });

      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');
      cache1.get('key1');
      cache2.get('nonexistent');

      const analytics = registry.getGlobalAnalytics();

      expect(analytics.cache1.sets).toBe(1);
      expect(analytics.cache1.hits).toBe(1);
      expect(analytics.cache2.sets).toBe(1);
      expect(analytics.cache2.misses).toBe(1);
    });
  });

  describe('globalCacheRegistry', () => {
    it('provides a global registry instance', () => {
      expect(globalCacheRegistry).toBeInstanceOf(CacheRegistry);
    });

    it('maintains state across imports', () => {
      globalCacheRegistry.create('test-cache');
      expect(globalCacheRegistry.list()).toContain('test-cache');

      // Cleanup for other tests
      globalCacheRegistry.delete('test-cache');
    });
  });
});
