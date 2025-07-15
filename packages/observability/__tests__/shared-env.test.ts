import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('../src/server-next', () => ({
  createServerObservability: vi.fn(),
}));

vi.mock('../src/server', () => ({
  createServerObservability: vi.fn(),
}));

vi.mock('../src/logger-functions', () => ({
  configureLogger: vi.fn(),
  logDebug: vi.fn(),
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

describe('shared-env', () => {
  let originalWindow: typeof window;
  let originalProcess: typeof process;
  let originalGlobalThis: typeof globalThis;

  beforeEach(() => {
    // Store original values
    originalWindow = (globalThis as any).window;
    originalProcess = (globalThis as any).process;
    originalGlobalThis = globalThis;
    
    // Clear mocks
    vi.clearAllMocks();
    
    // Reset environment
    delete (globalThis as any).window;
    delete (globalThis as any).__NEXT_DATA__;
    delete (globalThis as any).EdgeRuntime;
    
    // Set up clean process environment
    (globalThis as any).process = {
      env: {},
      title: 'node',
    };
  });

  afterEach(() => {
    // Restore original values
    if (originalWindow) {
      (globalThis as any).window = originalWindow;
    }
    (globalThis as any).process = originalProcess;
  });

  describe('environment detection', () => {
    test('should detect browser environment when window exists', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      // Should return browser fallback manager
      expect(typeof manager.log).toBe('function');
      expect(typeof manager.captureException).toBe('function');
      expect(typeof manager.captureMessage).toBe('function');
    });

    test('should detect browser environment when globalThis.window exists', async () => {
      // Set up browser environment via globalThis
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      // Should return browser fallback manager
      expect(typeof manager.log).toBe('function');
      expect(typeof manager.captureException).toBe('function');
      expect(typeof manager.captureMessage).toBe('function');
    });

    test('should detect Next.js environment with NEXT_RUNTIME', async () => {
      // Set up Next.js environment
      (globalThis as any).process = {
        env: { NEXT_RUNTIME: 'nodejs' },
        title: 'next-server',
      };
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNextObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNextObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should detect Next.js environment with __NEXT_DATA__', async () => {
      // Set up Next.js environment
      (globalThis as any).__NEXT_DATA__ = {};
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNextObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNextObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should detect Next.js environment with EdgeRuntime', async () => {
      // Set up Edge runtime environment
      (globalThis as any).EdgeRuntime = 'edge-runtime';
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNextObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNextObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should detect Next.js environment with next process title', async () => {
      // Set up Next.js environment
      (globalThis as any).process = {
        env: {},
        title: 'next-server',
      };
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNextObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNextObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should detect Next.js environment with development mode and NEXT_PUBLIC_APP_ENV', async () => {
      // Set up Next.js development environment
      (globalThis as any).process = {
        env: { 
          NODE_ENV: 'development',
          NEXT_PUBLIC_APP_ENV: 'development'
        },
        title: 'node',
      };
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNextObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNextObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should use standard Node.js environment when not Next.js', async () => {
      // Set up standard Node.js environment
      (globalThis as any).process = {
        env: { NODE_ENV: 'production' },
        title: 'node',
      };
      
      const { createServerObservability: createNodeObservability } = vi.mocked(await import('../src/server'));
      const mockManager = { log: vi.fn(), captureException: vi.fn() };
      createNodeObservability.mockResolvedValue(mockManager);

      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      expect(createNodeObservability).toHaveBeenCalledWith({ providers: {} });
      expect(manager).toBe(mockManager);
    });

    test('should handle error when server modules fail to load', async () => {
      // Set up standard Node.js environment
      (globalThis as any).process = {
        env: { NODE_ENV: 'production' },
        title: 'node',
      };
      
      const { createServerObservability: createNodeObservability } = vi.mocked(await import('../src/server'));
      createNodeObservability.mockRejectedValue(new Error('Module not found'));

      const { createServerObservability } = await import('../src/shared-env');
      
      await expect(createServerObservability({ providers: {} })).rejects.toThrow(
        '[Observability] Failed to load server modules: Error: Module not found'
      );
    });

    test('should handle error when Next.js modules fail to load', async () => {
      // Set up Next.js environment
      (globalThis as any).process = {
        env: { NEXT_RUNTIME: 'nodejs' },
        title: 'next-server',
      };
      
      const { createServerObservability: createNextObservability } = vi.mocked(await import('../src/server-next'));
      createNextObservability.mockRejectedValue(new Error('Next.js module not found'));

      const { createServerObservability } = await import('../src/shared-env');
      
      await expect(createServerObservability({ providers: {} })).rejects.toThrow(
        '[Observability] Failed to load server modules: Error: Next.js module not found'
      );
    });
  });

  describe('browser fallback manager', () => {
    test('should provide working log method with different levels', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      // Test different log levels
      await manager.log('info', 'Info message', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Info message', { data: 'test' });
      
      await manager.log('error', 'Error message', { error: 'test' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Observability] Error message', { error: 'test' });
      
      await manager.log('warn', 'Warning message', { warning: 'test' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Observability] Warning message', { warning: 'test' });
      
      await manager.log('debug', 'Debug message', { debug: 'test' });
      expect(consoleDebugSpy).toHaveBeenCalledWith('[Observability] Debug message', { debug: 'test' });
      
      // Test without context
      await manager.log('info', 'Message without context');
      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Message without context', '');
      
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleDebugSpy.mockRestore();
    });

    test('should provide working captureException method', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      const error = new Error('Test error');
      const context = { userId: 'test123' };
      
      await manager.captureException(error, context);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Observability] Exception:', error, context);
      
      // Test without context
      await manager.captureException(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Observability] Exception:', error, '');
      
      consoleErrorSpy.mockRestore();
    });

    test('should provide working captureMessage method', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      const context = { userId: 'test123' };
      
      // Test different levels
      await manager.captureMessage('Info message', 'info', context);
      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Info message', context);
      
      await manager.captureMessage('Error message', 'error', context);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Observability] Error message', context);
      
      await manager.captureMessage('Warning message', 'warning', context);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Observability] Warning message', context);
      
      // Test default level (info)
      await manager.captureMessage('Default message');
      expect(consoleSpy).toHaveBeenCalledWith('[Observability] Default message', '');
      
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    test('should provide working initialize method', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      // Should be a no-op but not throw
      await expect(manager.initialize()).resolves.toBeUndefined();
    });

    test('should provide working synchronous methods', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      // Should be no-ops but not throw
      expect(() => manager.addBreadcrumb({ message: 'test' })).not.toThrow();
      expect(() => manager.setContext('key', { value: 'test' })).not.toThrow();
      expect(() => manager.setExtra('key', 'value')).not.toThrow();
      expect(() => manager.setUser({ id: 'test' })).not.toThrow();
      expect(() => manager.setTag('key', 'value')).not.toThrow();
      expect(() => manager.startSession()).not.toThrow();
      expect(() => manager.endSession()).not.toThrow();
    });

    test('should provide working startSpan method', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      const span = manager.startSpan('test-span');
      
      expect(span).toEqual({
        name: 'test-span',
        finish: expect.any(Function),
        setContext: expect.any(Function),
        setStatus: expect.any(Function),
      });
      
      // Should be no-ops but not throw
      expect(() => span.finish()).not.toThrow();
      expect(() => span.setContext('key', { value: 'test' })).not.toThrow();
      expect(() => span.setStatus('ok')).not.toThrow();
    });

    test('should provide working startTransaction method', async () => {
      // Set up browser environment
      (globalThis as any).window = {};
      
      const { createServerObservability } = await import('../src/shared-env');
      const manager = await createServerObservability({ providers: {} });
      
      const transaction = manager.startTransaction('test-transaction');
      
      expect(transaction).toEqual({
        name: 'test-transaction',
        finish: expect.any(Function),
        setContext: expect.any(Function),
        setStatus: expect.any(Function),
      });
      
      // Should be no-ops but not throw
      expect(() => transaction.finish()).not.toThrow();
      expect(() => transaction.setContext('key', { value: 'test' })).not.toThrow();
      expect(() => transaction.setStatus('ok')).not.toThrow();
    });
  });

  describe('environmentInfo', () => {
    test('should provide environment information object', async () => {
      const { environmentInfo } = await import('../src/shared-env');
      
      expect(environmentInfo).toBeDefined();
      expect(typeof environmentInfo).toBe('object');
      expect(environmentInfo).toHaveProperty('isNextJS');
      expect(environmentInfo).toHaveProperty('runtime');
      expect(environmentInfo).toHaveProperty('nodeEnv');
      expect(environmentInfo).toHaveProperty('processTitle');
    });

    test('should have boolean isNextJS property', async () => {
      const { environmentInfo } = await import('../src/shared-env');
      
      expect(typeof environmentInfo.isNextJS).toBe('boolean');
    });

    test('should have string runtime property', async () => {
      const { environmentInfo } = await import('../src/shared-env');
      
      expect(typeof environmentInfo.runtime).toBe('string');
    });

    test('should have nodeEnv property', async () => {
      const { environmentInfo } = await import('../src/shared-env');
      
      expect(environmentInfo.nodeEnv === undefined || typeof environmentInfo.nodeEnv === 'string').toBe(true);
    });

    test('should have processTitle property', async () => {
      const { environmentInfo } = await import('../src/shared-env');
      
      expect(environmentInfo.processTitle === undefined || typeof environmentInfo.processTitle === 'string').toBe(true);
    });
  });

  describe('re-exports', () => {
    test('should re-export logger functions', async () => {
      const { configureLogger, logDebug, logError, logInfo, logWarn } = await import('../src/shared-env');
      
      expect(typeof configureLogger).toBe('function');
      expect(typeof logDebug).toBe('function');
      expect(typeof logError).toBe('function');
      expect(typeof logInfo).toBe('function');
      expect(typeof logWarn).toBe('function');
    });
  });
});
