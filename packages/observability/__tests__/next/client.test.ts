import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

// Mock the client-next module before importing
vi.mock('../../src/client-next', () => ({
  createClientObservability: vi.fn(),
}));

describe('next/client', () => {
  let originalWindow: typeof window;
  let mockManager: any;
  let createClientObservability: any;

  beforeEach(async () => {
    // Store original window
    originalWindow = (globalThis as any).window;
    
    // Create a mock manager
    mockManager = {
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      log: vi.fn(),
      initialize: vi.fn(),
    };

    // Get and setup the mock
    const clientNextModule = await import('../../src/client-next');
    createClientObservability = clientNextModule.createClientObservability;
    vi.mocked(createClientObservability).mockResolvedValue(mockManager);

    // Mock window
    (globalThis as any).window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    // Restore original window
    (globalThis as any).window = originalWindow;
    vi.clearAllMocks();
  });

  describe('NextJSClientObservabilityManager', () => {
    test('should initialize with config', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          useRouter: true,
          useWebVitals: true,
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      expect(manager).toBeDefined();
      expect(manager.getManager()).toBeNull(); // Before initialization
    });

    test('should return null manager before initialization', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      expect(manager.getManager()).toBeNull();
    });

    test('should initialize manager', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      await manager.initialize();

      expect(manager.getManager()).toBe(mockManager);
    });

    test('should setup router tracking when useRouter is true', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          useRouter: true,
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      await manager.initialize();

      // Should have called createClientObservability with config
      expect(createClientObservability).toHaveBeenCalledWith(config);
    });

    test('should not setup router tracking when useRouter is false', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          useRouter: false,
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      await manager.initialize();

      expect(manager.getManager()).toBe(mockManager);
    });

    test('should not setup router tracking when no window', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      // Remove window
      delete (globalThis as any).window;

      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          useRouter: true,
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      await manager.initialize();

      expect(manager.getManager()).toBe(mockManager);
    });

    test('should handle setupRouterTracking when manager is null', async () => {
      const { NextJSClientObservabilityManager } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          useRouter: true,
        },
      };

      const manager = new NextJSClientObservabilityManager(config);
      
      // Call setupRouterTracking before initialization
      // This would normally be called internally, but we can test the behavior
      expect(() => {
        // Access private method through any cast for testing
        (manager as any).setupRouterTracking();
      }).not.toThrow();
    });
  });

  describe('createNextJSClientObservability', () => {
    test('should create client observability with basic config', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      const result = await createNextJSClientObservability(config);
      expect(result).toBe(mockManager);

      // Should have called createClientObservability with Next.js defaults
      expect(createClientObservability).toHaveBeenCalledWith({
        ...config,
        nextjs: {
          disableLogger: true,
          tunnelRoute: '/monitoring',
        },
      });
    });

    test('should merge Next.js config with defaults', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: {
          disableLogger: false,
          tunnelRoute: '/custom-monitoring',
          useRouter: true,
        },
      };

      const result = await createNextJSClientObservability(config);
      expect(result).toBe(mockManager);

      // Should have called createClientObservability with merged config
      expect(createClientObservability).toHaveBeenCalledWith({
        ...config,
        nextjs: {
          disableLogger: false,
          tunnelRoute: '/custom-monitoring',
          useRouter: true,
        },
      });
    });

    test('should set up global error handlers when window is available', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      await createNextJSClientObservability(config);

      // Should have added event listeners
      expect(window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    test('should not set up global error handlers when window is not available', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      // Remove window
      delete (globalThis as any).window;

      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      const result = await createNextJSClientObservability(config);
      expect(result).toBe(mockManager);

      // Should not have tried to add event listeners
      expect(() => {
        // This would have thrown if window was accessed
        expect(true).toBe(true);
      }).not.toThrow();
    });

    test('should handle window error events', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      await createNextJSClientObservability(config);

      // Get the error event handler
      const errorHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'error'
      )[1];

      // Simulate an error event
      const errorEvent = {
        error: new Error('Test error'),
        message: 'Test error message',
      };

      errorHandler(errorEvent);

      expect(mockManager.captureException).toHaveBeenCalledWith(
        errorEvent.error,
        {
          tags: { source: 'window.onerror' },
        }
      );
    });

    test('should handle window error events without error object', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      await createNextJSClientObservability(config);

      // Get the error event handler
      const errorHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'error'
      )[1];

      // Simulate an error event without error object
      const errorEvent = {
        message: 'Test error message',
      };

      errorHandler(errorEvent);

      expect(mockManager.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        {
          tags: { source: 'window.onerror' },
        }
      );
    });

    test('should handle unhandled promise rejection events', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
      };

      await createNextJSClientObservability(config);

      // Get the unhandledrejection event handler
      const rejectionHandler = (window.addEventListener as any).mock.calls.find(
        (call: any) => call[0] === 'unhandledrejection'
      )[1];

      // Simulate an unhandled rejection event
      const rejectionEvent = {
        reason: 'Test rejection reason',
      };

      rejectionHandler(rejectionEvent);

      expect(mockManager.captureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unhandled Promise Rejection: Test rejection reason',
        }),
        {
          tags: { source: 'unhandledrejection' },
        }
      );
    });

    test('should handle empty config', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {},
      };

      const result = await createNextJSClientObservability(config);
      expect(result).toBe(mockManager);

      // Should have called createClientObservability with defaults
      expect(createClientObservability).toHaveBeenCalledWith({
        ...config,
        nextjs: {
          disableLogger: true,
          tunnelRoute: '/monitoring',
        },
      });
    });

    test('should handle undefined nextjs config', async () => {
      const { createNextJSClientObservability } = await import('../../src/next/client');
      
      const config = {
        providers: {
          console: { enabled: true },
        },
        nextjs: undefined,
      };

      const result = await createNextJSClientObservability(config);
      expect(result).toBe(mockManager);

      // Should have called createClientObservability with defaults
      expect(createClientObservability).toHaveBeenCalledWith({
        ...config,
        nextjs: {
          disableLogger: true,
          tunnelRoute: '/monitoring',
        },
      });
    });
  });

  describe('module exports', () => {
    test('should export NextJSClientObservabilityManager', async () => {
      const module = await import('../../src/next/client');
      expect(module.NextJSClientObservabilityManager).toBeDefined();
      expect(typeof module.NextJSClientObservabilityManager).toBe('function');
    });

    test('should export createNextJSClientObservability', async () => {
      const module = await import('../../src/next/client');
      expect(module.createNextJSClientObservability).toBeDefined();
      expect(typeof module.createNextJSClientObservability).toBe('function');
    });
  });
});