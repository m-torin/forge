/**
 * End-to-end multi-provider orchestration test
 * Validates the LazyMultiProvider system works correctly with multiple adapters
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyMultiProvider } from '../src/orchestration/lazy-multi-provider';
import type { AnalyticsEvent, IdentifyPayload, PagePayload } from '../src/types';

// Mock dynamic imports for testing
vi.mock('@repo/3p-vercel/adapter', () => ({
  VercelAdapter: vi.fn().mockImplementation(() => ({
    provider: 'vercel',
    initialize: vi.fn().mockResolvedValue(undefined),
    track: vi.fn().mockResolvedValue(true),
    identify: vi.fn().mockResolvedValue(true),
    page: vi.fn().mockResolvedValue(true),
    destroy: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
  })),
}));

vi.mock('@repo/3p-posthog/adapter', () => ({
  PostHogAdapter: vi.fn().mockImplementation(() => ({
    provider: 'posthog',
    initialize: vi.fn().mockResolvedValue(undefined),
    track: vi.fn().mockResolvedValue(true),
    identify: vi.fn().mockResolvedValue(true),
    page: vi.fn().mockResolvedValue(true),
    destroy: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
  })),
}));

describe('LazyMultiProvider Orchestration', () => {
  let multiProvider: LazyMultiProvider;

  beforeEach(() => {
    vi.clearAllMocks();

    multiProvider = new LazyMultiProvider({
      providers: {
        vercel: {
          enabled: true,
          priority: 1,
          loader: async () => {
            const { VercelAdapter } = await import('@repo/3p-vercel/adapter');
            return new VercelAdapter({
              provider: 'vercel' as const,
              enabled: true,
            });
          },
        },
        posthog: {
          enabled: true,
          priority: 2,
          loader: async () => {
            const { PostHogAdapter } = await import('@repo/3p-posthog/adapter');
            return new PostHogAdapter({
              provider: 'posthog' as const,
              enabled: true,
              apiHost: 'https://app.posthog.com',
            });
          },
        },
      },
      execution: {
        mode: 'parallel',
        continueOnError: true,
        timeout: 5000,
      },
    });
  });

  describe('Event Tracking', () => {
    it('should track events across all providers', async () => {
      const event: AnalyticsEvent = {
        name: 'Button Clicked',
        properties: {
          button_id: 'cta-signup',
          button_text: 'Sign Up Now',
          page: '/home',
        },
      };

      const results = await multiProvider.track(event);

      expect(results.success).toBe(true);
      expect(Object.keys(results.results)).toHaveLength(2);
      expect(results.results.vercel.success).toBe(true);
      expect(results.results.posthog.success).toBe(true);
    });

    it('should handle provider failures gracefully', async () => {
      // Mock one provider to fail
      vi.mocked(await import('@repo/3p-vercel/adapter')).VercelAdapter.mockImplementation(() => ({
        provider: 'vercel',
        initialize: vi.fn().mockResolvedValue(undefined),
        track: vi.fn().mockResolvedValue(false), // Simulate failure
        identify: vi.fn().mockResolvedValue(true),
        page: vi.fn().mockResolvedValue(true),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: false,
      }));

      const event: AnalyticsEvent = {
        name: 'Error Test',
        properties: { test: true },
      };

      const results = await multiProvider.track(event);

      expect(results.success).toBe(true); // Still successful due to fallback
      expect(Object.keys(results.results)).toHaveLength(2);
      expect(results.results.vercel.success).toBe(false); // Vercel failed
      expect(results.results.posthog.success).toBe(true); // PostHog succeeded
    });
  });

  describe('User Identification', () => {
    it('should identify users across all providers', async () => {
      const payload: IdentifyPayload = {
        userId: 'user-123',
        traits: {
          email: 'user@example.com',
          name: 'Test User',
          plan: 'premium',
        },
      };

      const results = await multiProvider.identify(payload);

      expect(results.success).toBe(true);
      expect(Object.keys(results.results)).toHaveLength(2);
      expect(results.results.vercel.success).toBe(true);
      expect(results.results.posthog.success).toBe(true);
    });
  });

  describe('Page Tracking', () => {
    it('should track page views across all providers', async () => {
      const payload: PagePayload = {
        name: 'Homepage',
        properties: {
          page_url: 'https://example.com/',
          page_title: 'Welcome to Example',
          referrer: 'https://google.com',
        },
      };

      const results = await multiProvider.page(payload);

      expect(results.success).toBe(true);
      expect(Object.keys(results.results)).toHaveLength(2);
      expect(results.results.vercel.success).toBe(true);
      expect(results.results.posthog.success).toBe(true);
    });
  });

  describe('Lazy Loading', () => {
    it('should not load providers until first use', async () => {
      // Create new instance to test lazy loading
      const lazyProvider = new LazyMultiProvider({
        providers: {
          vercel: {
            enabled: true,
            priority: 1,
            loader: async () => {
              const { VercelAdapter } = await import('@repo/3p-vercel/adapter');
              return new VercelAdapter({
                provider: 'vercel' as const,
                enabled: true,
              });
            },
          },
        },
        execution: {
          mode: 'parallel',
          continueOnError: true,
        },
      });

      // Verify provider not loaded yet
      expect(lazyProvider['loadedProviders'].size).toBe(0);

      // Track an event - should trigger lazy loading
      await lazyProvider.track({
        name: 'Lazy Load Test',
        properties: { test: true },
      });

      // Verify provider was loaded
      expect(lazyProvider['loadedProviders'].size).toBe(1);
    });

    it('should cache loaded providers for subsequent calls', async () => {
      const event1: AnalyticsEvent = {
        name: 'First Event',
        properties: { order: 1 },
      };

      const event2: AnalyticsEvent = {
        name: 'Second Event',
        properties: { order: 2 },
      };

      // First call - should load providers
      await multiProvider.track(event1);
      const loadedCount1 = multiProvider['loadedProviders'].size;

      // Second call - should use cached providers
      await multiProvider.track(event2);
      const loadedCount2 = multiProvider['loadedProviders'].size;

      expect(loadedCount1).toBe(2);
      expect(loadedCount2).toBe(2);
      expect(loadedCount1).toBe(loadedCount2); // No additional loading
    });
  });

  describe('Strategy Handling', () => {
    it('should handle "failover" strategy correctly', async () => {
      const firstProvider = new LazyMultiProvider({
        providers: {
          vercel: {
            enabled: true,
            priority: 1,
            loader: async () => {
              const { VercelAdapter } = await import('@repo/3p-vercel/adapter');
              return new VercelAdapter({ provider: 'vercel' as const, enabled: true });
            },
          },
          posthog: {
            enabled: true,
            priority: 2,
            loader: async () => {
              const { PostHogAdapter } = await import('@repo/3p-posthog/adapter');
              return new PostHogAdapter({ provider: 'posthog' as const, enabled: true });
            },
          },
        },
        execution: {
          mode: 'failover',
          continueOnError: false,
        },
      });

      const results = await firstProvider.track({
        name: 'Failover Strategy Test',
        properties: { strategy: 'failover' },
      });

      expect(results.success).toBe(true);
      expect(Object.keys(results.results).length).toBeGreaterThan(0);
    });

    it('should handle timeout correctly', async () => {
      // Mock a slow provider
      vi.mocked(await import('@repo/3p-vercel/adapter')).VercelAdapter.mockImplementation(() => ({
        provider: 'vercel',
        initialize: vi.fn().mockResolvedValue(undefined),
        track: vi
          .fn()
          .mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 10000))), // 10s delay
        identify: vi.fn().mockResolvedValue(true),
        page: vi.fn().mockResolvedValue(true),
        destroy: vi.fn().mockResolvedValue(undefined),
        isInitialized: false,
      }));

      const timeoutProvider = new LazyMultiProvider({
        providers: {
          vercel: {
            enabled: true,
            priority: 1,
            loader: async () => {
              const { VercelAdapter } = await import('@repo/3p-vercel/adapter');
              return new VercelAdapter({ provider: 'vercel' as const, enabled: true });
            },
          },
        },
        execution: {
          mode: 'parallel',
          continueOnError: false,
          timeout: 100, // 100ms timeout
        },
      });

      const start = Date.now();
      const results = await timeoutProvider.track({
        name: 'Timeout Test',
        properties: { test: true },
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200); // Should timeout quickly
      expect(results.success).toBe(false);
      expect(results.results.vercel?.error?.message).toContain('timeout');
    });
  });

  describe('Cleanup', () => {
    it('should destroy all loaded providers on cleanup', async () => {
      // Load providers by tracking an event
      await multiProvider.track({
        name: 'Cleanup Test',
        properties: { test: true },
      });

      expect(multiProvider['loadedProviders'].size).toBe(2);

      // Cleanup
      await multiProvider.destroy();

      // Verify all providers were cleared from the map
      expect(multiProvider['loadedProviders'].size).toBe(0);
    }, 10000);
  });
});
