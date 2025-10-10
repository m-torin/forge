/**
 * Cache Eviction Tests
 * Tests for BoundedCache LRU eviction behavior in rate-limit and orchestration manager
 */

import '@repo/qa/vitest/setup/next-app';
import { describe, expect } from 'vitest';

// Import the rate limit provider to test its cache eviction
import { RateLimitProvider } from '../src/providers/rate-limit/provider';

// Import manager to test execution metrics cache
import { OrchestrationManager } from '../src/shared/utils/manager';

describe('cache Eviction Tests', () => {
  describe('rateLimitProvider Cache Eviction', () => {
    test('should evict oldest entries when cache exceeds maxSize', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        defaultLimit: { requests: 10, window: 60000 },
        enableRedis: false, // Use in-memory only for testing
      });

      // Access the private rateLimiters cache for testing
      const cache = (provider as any).rateLimiters;

      // Fill cache beyond capacity (default maxSize is 1000, so use smaller for testing)
      const testCache = new (cache.constructor as any)({ maxSize: 3, ttl: 0 });

      // Add entries
      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');
      testCache.set('key3', 'value3');
      expect(testCache.size).toBe(3);

      // Add one more to trigger eviction
      testCache.set('key4', 'value4');
      expect(testCache.size).toBe(3); // Still 3, oldest evicted

      // First key should be evicted
      expect(testCache.has('key1')).toBeFalsy();
      expect(testCache.has('key2')).toBeTruthy();
      expect(testCache.has('key3')).toBeTruthy();
      expect(testCache.has('key4')).toBeTruthy();
    });

    test('should implement LRU behavior correctly', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        defaultLimit: { requests: 10, window: 60000 },
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 3, ttl: 0 });

      // Add initial entries
      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');
      testCache.set('key3', 'value3');

      // Access key1 to make it recently used
      testCache.get('key1');

      // Add new entry - key2 should be evicted (oldest non-accessed)
      testCache.set('key4', 'value4');

      expect(testCache.has('key1')).toBeTruthy(); // Recently accessed
      expect(testCache.has('key2')).toBeFalsy(); // Evicted
      expect(testCache.has('key3')).toBeTruthy();
      expect(testCache.has('key4')).toBeTruthy();
    });

    test('should clear cache properly during cleanup', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        defaultLimit: { requests: 10, window: 60000 },
        enableRedis: false,
      });

      // Add some test entries
      const cache = (provider as any).rateLimiters;
      cache.set('test1', { limit: 10 });
      cache.set('test2', { limit: 20 });

      expect(cache.size).toBeGreaterThan(0);

      // Clear cache
      provider.clearCache();

      expect(cache.size).toBe(0);
    });
  });

  describe('orchestrationManager Cache Eviction', () => {
    test('should evict execution metrics when cache is full', async () => {
      const manager = new OrchestrationManager({
        enableMetrics: true,
        maxConcurrentExecutions: 10,
      });

      await manager.initialize();

      // Access private executionMetrics cache
      const cache = (manager as any).executionMetrics;
      const testCache = new (cache.constructor as any)({ maxSize: 2, ttl: 0 }); // Small cache for testing

      // Add metrics
      testCache.set('step1', { count: 1, avgDuration: 100, lastExecution: Date.now() });
      testCache.set('step2', { count: 2, avgDuration: 200, lastExecution: Date.now() });
      expect(testCache.size).toBe(2);

      // Add third metric - should evict first
      testCache.set('step3', { count: 3, avgDuration: 300, lastExecution: Date.now() });

      expect(testCache.size).toBe(2);
      expect(testCache.has('step1')).toBeFalsy(); // Evicted
      expect(testCache.has('step2')).toBeTruthy();
      expect(testCache.has('step3')).toBeTruthy();

      await manager.shutdown();
    });

    test('should clean up metrics during shutdown', async () => {
      const manager = new OrchestrationManager({
        enableMetrics: true,
      });

      await manager.initialize();

      // Add some metrics
      const cache = (manager as any).executionMetrics;
      cache.set('metric1', { count: 1 });
      cache.set('metric2', { count: 2 });

      expect(cache.size).toBeGreaterThan(0);

      // Shutdown should clean up
      await manager.shutdown();

      expect(cache.size).toBe(0);
    });
  });

  describe('memory Pressure Scenarios', () => {
    test('should handle rapid cache operations without memory leaks', () => {
      const provider = new RateLimitProvider({
        algorithm: 'sliding-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 100, ttl: 0 });

      // Simulate rapid operations
      for (let i = 0; i < 1000; i++) {
        testCache.set(`key${i}`, `value${i}`);

        // Access some random keys to test LRU behavior
        if (i % 10 === 0 && i > 0) {
          testCache.get(`key${i - 5}`);
        }
      }

      // Cache should be bounded to maxSize
      expect(testCache.size).toBe(100);

      // Recent entries should exist
      expect(testCache.has('key999')).toBeTruthy();
      expect(testCache.has('key998')).toBeTruthy();

      // Very old entries should be evicted
      expect(testCache.has('key0')).toBeFalsy();
      expect(testCache.has('key1')).toBeFalsy();
    });

    test('should maintain cache performance under load', () => {
      // Use the actual BoundedCache implementation
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 50, ttl: 0 });

      const start = performance.now();

      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        testCache.set(`key${i}`, i);
        if (i % 3 === 0) {
          testCache.get(`key${Math.floor(i / 2)}`);
        }
      }

      const duration = performance.now() - start;

      // Should complete reasonably quickly
      expect(duration).toBeLessThan(1000); // Less than 1 second
      expect(testCache.size).toBe(50); // Properly bounded
    });
  });

  describe('tTL (Time-To-Live) Functionality', () => {
    test('should expire entries based on TTL', async () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 100, ttl: 100 }); // 100ms TTL

      testCache.set('key1', 'value1');
      expect(testCache.has('key1')).toBeTruthy();
      expect(testCache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(testCache.has('key1')).toBeFalsy();
      expect(testCache.get('key1')).toBeUndefined();
    });

    test('should clean up expired entries during cleanup', async () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 100, ttl: 50 }); // 50ms TTL

      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');
      expect(testCache.size).toBe(2);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 80));

      // Cleanup should remove expired entries
      testCache.cleanup();
      expect(testCache.size).toBe(0);
    });

    test('should update timestamp when accessing entries', async () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({ maxSize: 100, ttl: 100 }); // 100ms TTL

      testCache.set('key1', 'value1');

      // Access after 60ms (should refresh timestamp)
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(testCache.get('key1')).toBe('value1'); // This should refresh timestamp

      // Wait another 60ms (total 120ms, but timestamp was refreshed)
      await new Promise(resolve => setTimeout(resolve, 60));

      // Entry should still be valid because it was accessed
      expect(testCache.has('key1')).toBeTruthy();
    });
  });

  describe('analytics and Monitoring', () => {
    test('should track cache hit/miss statistics when analytics enabled', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({
        maxSize: 100,
        ttl: 0,
        enableAnalytics: true,
      });

      // Set and get entries
      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');

      // Cache hits
      testCache.get('key1');
      testCache.get('key2');

      // Cache miss
      testCache.get('nonexistent');

      const analytics = testCache.getAnalytics();
      expect(analytics.hits).toBe(2);
      expect(analytics.misses).toBe(1);
      expect(analytics.sets).toBe(2);
    });

    test('should provide comprehensive statistics via provider stats', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      // Add some rate limiters
      (provider as any).rateLimiters.set('limiter1', { type: 'fixed-window' });
      (provider as any).rateLimiters.set('limiter2', { type: 'sliding-window' });

      const stats = provider.getStats();

      expect(stats.activeLimiters).toBe(2);
      expect(stats.cacheAnalytics).toBeDefined();
    });

    test('should track delete operations when analytics enabled', () => {
      const provider = new RateLimitProvider({
        algorithm: 'fixed-window',
        enableRedis: false,
      });

      const cache = (provider as any).rateLimiters;
      const testCache = new (cache.constructor as any)({
        maxSize: 100,
        ttl: 0,
        enableAnalytics: true,
      });

      testCache.set('key1', 'value1');
      testCache.set('key2', 'value2');

      const deleted = testCache.delete('key1');
      expect(deleted).toBeTruthy();

      const analytics = testCache.getAnalytics();
      expect(analytics.sets).toBe(2);
      expect(analytics.deletes).toBe(1);
    });
  });
});
