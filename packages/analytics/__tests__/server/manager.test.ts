import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock the providers to avoid external dependencies
vi.mock('@/providers/console/server', () => ({
  ConsoleProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    flush: vi.fn(),
  })),
}));

vi.mock('@/providers/posthog/server', () => ({
  PostHogServerProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    flush: vi.fn(),
  })),
}));

vi.mock('@/providers/segment/server', () => ({
  SegmentServerProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    flush: vi.fn(),
  })),
}));

vi.mock('@/providers/vercel/server', () => ({
  VercelServerProvider: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    flush: vi.fn(),
  })),
}));

// Mock the manager utility
const mockManager = {
  initialize: vi.fn(),
  track: vi.fn(),
  identify: vi.fn(),
  page: vi.fn(),
  flush: vi.fn(),
  getProviders: vi.fn(),
};

const mockCreateAnalyticsManager = vi.fn(() => mockManager);

vi.mock('@/shared/utils/manager', () => ({
  createAnalyticsManager: mockCreateAnalyticsManager,
}));

describe('Server Analytics Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createServerAnalytics', () => {
    test('should create and initialize server analytics manager', async () => {
      const { createServerAnalytics } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      const result = await createServerAnalytics(config);

      expect(mockCreateAnalyticsManager).toHaveBeenCalledWith(config, expect.any(Object));
      expect(mockManager.initialize).toHaveBeenCalled();
      expect(result).toBe(mockManager);
    });

    test('should handle initialization errors gracefully', async () => {
      const { createServerAnalytics } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      mockManager.initialize.mockRejectedValue(new Error('Init failed'));

      await expect(createServerAnalytics(config)).rejects.toThrow('Init failed');
    });

    test('should pass provider registry to manager', async () => {
      const { createServerAnalytics } = await import('@/server/manager');
      const { ConsoleProvider } = await import('@/providers/console/server');
      const { PostHogServerProvider } = await import('@/providers/posthog/server');
      const { SegmentServerProvider } = await import('@/providers/segment/server');
      const { VercelServerProvider } = await import('@/providers/vercel/server');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
            posthog: { enabled: true },
            segment: { enabled: true },
            vercel: { enabled: true },
          },
        },
      };

      await createServerAnalytics(config);

      expect(mockCreateAnalyticsManager).toHaveBeenCalledWith(config, expect.any(Object));
      
      // Test that provider registry functions work
      const [, providerRegistry] = mockCreateAnalyticsManager.mock.calls[0];
      
      // Test console provider
      providerRegistry.console({ enabled: true });
      expect(ConsoleProvider).toHaveBeenCalledWith({ enabled: true });
      
      // Test posthog provider
      providerRegistry.posthog({ enabled: true });
      expect(PostHogServerProvider).toHaveBeenCalledWith({ enabled: true });
      
      // Test segment provider
      providerRegistry.segment({ enabled: true });
      expect(SegmentServerProvider).toHaveBeenCalledWith({ enabled: true });
      
      // Test vercel provider
      providerRegistry.vercel({ enabled: true });
      expect(VercelServerProvider).toHaveBeenCalledWith({ enabled: true });
    });
  });

  describe('createServerAnalyticsUninitialized', () => {
    test('should create server analytics manager without initialization', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      const result = createServerAnalyticsUninitialized(config);

      expect(mockCreateAnalyticsManager).toHaveBeenCalledWith(config, expect.any(Object));
      expect(mockManager.initialize).not.toHaveBeenCalled();
      expect(result).toBe(mockManager);
    });

    test('should pass correct provider registry', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      createServerAnalyticsUninitialized(config);

      expect(mockCreateAnalyticsManager).toHaveBeenCalledWith(config, expect.any(Object));
      
      // Verify the provider registry has the expected keys
      const [, providerRegistry] = mockCreateAnalyticsManager.mock.calls[0];
      expect(providerRegistry).toHaveProperty('console');
      expect(providerRegistry).toHaveProperty('posthog');
      expect(providerRegistry).toHaveProperty('segment');
      expect(providerRegistry).toHaveProperty('vercel');
    });

    test('should handle different config structures', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      
      const configs = [
        {
          global: {
            providers: {
              console: { enabled: false },
            },
          },
        },
        {
          global: {
            providers: {
              posthog: { enabled: true, apiKey: 'test' },
            },
          },
        },
        {
          global: {
            providers: {
              segment: { enabled: true, writeKey: 'test' },
            },
          },
        },
      ];

      configs.forEach(config => {
        createServerAnalyticsUninitialized(config);
        expect(mockCreateAnalyticsManager).toHaveBeenCalledWith(config, expect.any(Object));
      });
    });
  });

  describe('Provider Registry', () => {
    test('should have all expected providers', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      createServerAnalyticsUninitialized(config);

      const [, providerRegistry] = mockCreateAnalyticsManager.mock.calls[0];
      
      expect(typeof providerRegistry.console).toBe('function');
      expect(typeof providerRegistry.posthog).toBe('function');
      expect(typeof providerRegistry.segment).toBe('function');
      expect(typeof providerRegistry.vercel).toBe('function');
    });

    test('should create providers with correct configurations', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      const { ConsoleProvider } = await import('@/providers/console/server');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      createServerAnalyticsUninitialized(config);

      const [, providerRegistry] = mockCreateAnalyticsManager.mock.calls[0];
      
      const providerConfig = { enabled: true, debug: true };
      providerRegistry.console(providerConfig);
      
      expect(ConsoleProvider).toHaveBeenCalledWith(providerConfig);
    });
  });

  describe('Export Verification', () => {
    test('should export createServerAnalytics function', async () => {
      const module = await import('@/server/manager');
      expect(typeof module.createServerAnalytics).toBe('function');
    });

    test('should export createServerAnalyticsUninitialized function', async () => {
      const module = await import('@/server/manager');
      expect(typeof module.createServerAnalyticsUninitialized).toBe('function');
    });
  });

  describe('Function Behavior', () => {
    test('createServerAnalytics should return a promise', async () => {
      const { createServerAnalytics } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      const result = createServerAnalytics(config);
      expect(result).toBeInstanceOf(Promise);
    });

    test('createServerAnalyticsUninitialized should return synchronously', async () => {
      const { createServerAnalyticsUninitialized } = await import('@/server/manager');
      
      const config = {
        global: {
          providers: {
            console: { enabled: true },
          },
        },
      };

      const result = createServerAnalyticsUninitialized(config);
      expect(result).toBe(mockManager);
    });
  });
});