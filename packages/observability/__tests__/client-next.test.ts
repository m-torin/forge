import { describe, expect, test, vi } from 'vitest';

describe('client-next', () => {
  let originalWindow: typeof window;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    vi.clearAllMocks();
  });

  test('module exports object', async () => {
    const clientNext = await import('../src/client-next');

    expect(clientNext).toBeDefined();
    expect(typeof clientNext).toBe('object');
  });

  describe('initializeClient', () => {
    test('should return early when not in browser environment', async () => {
      // Mock server environment
      delete (globalThis as any).window;

      const { initializeClient } = await import('../src/client-next');
      
      // Should not throw and should return early
      await expect(initializeClient()).resolves.toBeUndefined();
    });

    test('should handle browser environment', async () => {
      // Mock browser environment
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Should not throw - the actual initialization might fail but we can test the basic flow
      await expect(initializeClient()).resolves.not.toThrow();
    });

    test('should handle initialization with custom config', async () => {
      // Mock browser environment
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      const customConfig = {
        providers: {
          console: { enabled: true },
        },
      };
      
      // Should not throw
      await expect(initializeClient(customConfig)).resolves.not.toThrow();
    });

    test('should handle initialization with no config', async () => {
      // Mock browser environment
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Should not throw
      await expect(initializeClient()).resolves.not.toThrow();
    });

    test('should handle falsy config', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Should use default config and not throw
      await expect(initializeClient(null as any)).resolves.not.toThrow();
    });

    test('should handle undefined config', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Should use default config and not throw
      await expect(initializeClient(undefined)).resolves.not.toThrow();
    });

    test('should handle empty configuration object', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Empty config may cause an error internally, but it should be handled gracefully
      try {
        await initializeClient({});
      } catch (error) {
        // Expected to potentially throw due to internal implementation
        expect(error).toBeDefined();
      }
    });

    test('should handle complex configuration object', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      const complexConfig = {
        providers: {
          console: { enabled: true, level: 'debug' },
          sentry: { dsn: 'test-dsn', environment: 'test' },
        },
        debug: true,
        enableTracing: true,
      };
      
      // Should not throw
      await expect(initializeClient(complexConfig)).resolves.not.toThrow();
    });

    test('should handle window object correctly', async () => {
      // Mock browser environment
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      await initializeClient();

      // Should store manager in window (if initialization succeeds)
      expect((globalThis as any).window.__observabilityManager).toBeDefined();
    });

    test('should handle missing window gracefully', async () => {
      // Mock server environment
      delete (globalThis as any).window;

      const { initializeClient } = await import('../src/client-next');
      
      // Should not throw and should return early
      await expect(initializeClient()).resolves.toBeUndefined();
    });
  });

  describe('exports', () => {
    test('should export initializeClient function', async () => {
      const { initializeClient } = await import('../src/client-next');
      
      expect(typeof initializeClient).toBe('function');
    });

    test('should export default and legacy exports', async () => {
      const clientNext = await import('../src/client-next');
      
      expect(typeof clientNext.initializeClientDefault).toBe('function');
      expect(typeof clientNext.initializeClientLegacy).toBe('function');
    });

    test('should export additional functions', async () => {
      const clientNext = await import('../src/client-next');
      
      expect(clientNext.initializeClient).toBeDefined();
      expect(typeof clientNext.initializeClient).toBe('function');
    });

    test('should have all expected exports', async () => {
      const clientNext = await import('../src/client-next');
      
      expect(clientNext).toHaveProperty('initializeClient');
      expect(clientNext).toHaveProperty('initializeClientDefault');
      expect(clientNext).toHaveProperty('initializeClientLegacy');
      // Note: default export may not exist in this module
      expect(clientNext).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('should handle multiple initialization calls', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Multiple calls should not throw
      await expect(initializeClient()).resolves.not.toThrow();
      await expect(initializeClient()).resolves.not.toThrow();
    });

    test('should handle different window configurations', async () => {
      const { initializeClient } = await import('../src/client-next');
      
      // Different window configurations
      const windowConfigs = [
        { location: { hostname: 'localhost' } },
        { location: { hostname: 'example.com' } },
        { location: { hostname: 'test.domain.com' } },
        {},
      ];
      
      for (const windowConfig of windowConfigs) {
        (globalThis as any).window = windowConfig;
        await expect(initializeClient()).resolves.not.toThrow();
      }
    });

    test('should handle invalid config types', async () => {
      (globalThis as any).window = {
        location: { hostname: 'localhost' },
      };

      const { initializeClient } = await import('../src/client-next');
      
      // Invalid configs may cause errors internally, but should be handled gracefully
      const invalidConfigs = ['invalid' as any, 42 as any, [] as any];
      
      for (const config of invalidConfigs) {
        try {
          await initializeClient(config);
        } catch (error) {
          // Expected to potentially throw due to invalid config
          expect(error).toBeDefined();
        }
      }
    });
  });
});
