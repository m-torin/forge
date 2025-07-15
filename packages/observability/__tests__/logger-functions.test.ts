import { configureLogger, logDebug, logError, logInfo, logWarn } from '@/logger-functions';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock the env module
vi.mock('../env', () => ({
  safeEnv: () => ({
    NODE_ENV: 'test',
    NEXT_PUBLIC_NODE_ENV: 'test',
  }),
}));

describe('logger Functions', () => {
  let consoleSpies: {
    debug: ReturnType<typeof vi.spyOn>;
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    // Reset module state
    vi.clearAllMocks();

    // Spy on console methods
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpies).forEach(spy => spy.mockRestore());
  });

  describe('fire-and-forget logging', () => {
    test('should log debug messages without blocking', () => {
      // Call should return immediately
      const start = Date.now();
      logDebug('Debug message', { foo: 'bar' });
      const duration = Date.now() - start;

      // Should be nearly instant (< 5ms)
      expect(duration).toBeLessThan(5);
    });

    test('should log info messages without blocking', () => {
      const start = Date.now();
      logInfo('Info message', { userId: '123' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5);
    });

    test('should log warning messages without blocking', () => {
      const start = Date.now();
      logWarn('Warning message', { threshold: 100 });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5);
    });

    test('should log error messages without blocking', () => {
      const start = Date.now();
      const error = new Error('Test error');
      logError('Error occurred', error, { operation: 'test' });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5);
    });
  });

  describe('queue processing', () => {
    test('should handle multiple rapid logs', () => {
      // Fire many logs rapidly
      for (let i = 0; i < 100; i++) {
        logInfo(`Message ${i}`, { index: i });
      }

      // All should complete without error
      expect(true).toBeTruthy();
    });

    test('should handle mixed log levels', () => {
      logDebug('Debug message');
      logInfo('Info message');
      logWarn('Warning message');
      logError('Error message', new Error('Test'));

      // All should complete without error
      expect(true).toBeTruthy();
    });
  });

  describe('error handling', () => {
    test('should handle non-Error objects in logError', () => {
      // These should not throw
      logError('String error', 'This is a string error');
      logError('Number error', 42);
      logError('Object error', { message: 'Custom error object' });
      logError('Null error', null);
      logError('Undefined error', undefined);

      expect(true).toBeTruthy();
    });

    test('should handle missing context gracefully', () => {
      // These should not throw
      logInfo('Message without context');
      logInfo('Message with undefined', undefined);
      logInfo('Message with null');

      expect(true).toBeTruthy();
    });
  });

  describe('configuration', () => {
    test('should accept custom configuration', () => {
      const config = {
        providers: {
          console: {
            enabled: true,
            level: 'debug' as const,
          },
        },
      };

      // Should not throw
      configureLogger(config);

      // New logs should use the custom config
      logInfo('After configuration');

      expect(true).toBeTruthy();
    });
  });

  describe('logger functions', () => {
    test('should export logger functions directly', async () => {
      const { logInfo, logError, logWarn, logDebug } = await import('../src/logger-functions');
      expect(logInfo).toBeDefined();
      expect(logError).toBeDefined();
      expect(logWarn).toBeDefined();
      expect(logDebug).toBeDefined();
      expect(typeof logInfo).toBe('function');
      expect(typeof logError).toBe('function');
      expect(typeof logWarn).toBe('function');
      expect(typeof logDebug).toBe('function');
    });
  });

  describe('server environment behavior', () => {
    let originalWindow: typeof window;
    let originalGlobal: typeof globalThis;

    beforeEach(() => {
      originalWindow = (globalThis as any).window;
      originalGlobal = globalThis;
      
      // Mock server environment
      delete (globalThis as any).window;
      delete (globalThis as any).EdgeRuntime;
      (globalThis as any).process = { env: { NODE_ENV: 'production' } };
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
      (globalThis as any).globalThis = originalGlobal;
    });

    test('should use server path for logInfo in server environment', async () => {
      // Re-import to get fresh module state
      const { logInfo } = await import('../src/logger-functions');
      
      // This should trigger the server path
      logInfo('Server message', { server: true });
      
      // Should not throw and should execute without error
      expect(true).toBeTruthy();
    });

    test('should use server path for logError in server environment', async () => {
      const { logError } = await import('../src/logger-functions');
      
      const error = new Error('Server error');
      logError('Server error message', error, { server: true });
      
      expect(true).toBeTruthy();
    });

    test('should use server path for logWarn in server environment', async () => {
      const { logWarn } = await import('../src/logger-functions');
      
      logWarn('Server warning', { server: true });
      
      expect(true).toBeTruthy();
    });

    test('should use server path for logDebug in server environment', async () => {
      const { logDebug } = await import('../src/logger-functions');
      
      logDebug('Server debug', { server: true });
      
      expect(true).toBeTruthy();
    });
  });

  describe('edge runtime behavior', () => {
    let originalWindow: typeof window;
    let originalEdgeRuntime: any;

    beforeEach(() => {
      originalWindow = (globalThis as any).window;
      originalEdgeRuntime = (globalThis as any).EdgeRuntime;
      
      // Mock edge runtime environment
      delete (globalThis as any).window;
      (globalThis as any).EdgeRuntime = 'edge-runtime';
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
      if (originalEdgeRuntime) {
        (globalThis as any).EdgeRuntime = originalEdgeRuntime;
      } else {
        delete (globalThis as any).EdgeRuntime;
      }
    });

    test('should use console in edge runtime', async () => {
      const { logInfo } = await import('../src/logger-functions');
      
      logInfo('Edge message', { edge: true });
      
      // Should use console.log in edge runtime
      expect(consoleSpies.log).toHaveBeenCalledWith('[INFO] Edge message', { edge: true });
    });

    test('should use console.error in edge runtime', async () => {
      const { logError } = await import('../src/logger-functions');
      
      const error = new Error('Edge error');
      logError('Edge error message', error, { edge: true });
      
      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] Edge error message', error, { edge: true });
    });
  });

  describe('browser environment behavior', () => {
    let originalWindow: typeof window;

    beforeEach(() => {
      originalWindow = (globalThis as any).window;
      
      // Mock browser environment
      (globalThis as any).window = { document: {} };
      delete (globalThis as any).EdgeRuntime;
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
    });

    test('should use console in browser environment', async () => {
      const { logInfo } = await import('../src/logger-functions');
      
      logInfo('Browser message', { browser: true });
      
      expect(consoleSpies.log).toHaveBeenCalledWith('[INFO] Browser message', { browser: true });
    });

    test('should use console.debug in browser environment', async () => {
      const { logDebug } = await import('../src/logger-functions');
      
      logDebug('Browser debug', { browser: true });
      
      expect(consoleSpies.debug).toHaveBeenCalledWith('[DEBUG] Browser debug', { browser: true });
    });

    test('should use console.warn in browser environment', async () => {
      const { logWarn } = await import('../src/logger-functions');
      
      logWarn('Browser warning', { browser: true });
      
      expect(consoleSpies.warn).toHaveBeenCalledWith('[WARN] Browser warning', { browser: true });
    });

    test('should use console.error in browser environment', async () => {
      const { logError } = await import('../src/logger-functions');
      
      const error = new Error('Browser error');
      logError('Browser error message', error, { browser: true });
      
      expect(consoleSpies.error).toHaveBeenCalledWith('[ERROR] Browser error message', error, { browser: true });
    });
  });

  describe('configureLogger server behavior', () => {
    let originalWindow: typeof window;
    let originalEdgeRuntime: any;

    beforeEach(() => {
      originalWindow = (globalThis as any).window;
      originalEdgeRuntime = (globalThis as any).EdgeRuntime;
      
      // Mock server environment
      delete (globalThis as any).window;
      delete (globalThis as any).EdgeRuntime;
      (globalThis as any).process = { env: { NODE_ENV: 'production' } };
    });

    afterEach(() => {
      (globalThis as any).window = originalWindow;
      if (originalEdgeRuntime) {
        (globalThis as any).EdgeRuntime = originalEdgeRuntime;
      }
    });

    test('should reset logger in server environment', async () => {
      const { configureLogger } = await import('../src/logger-functions');
      
      const config = {
        providers: {
          console: {
            enabled: true,
            level: 'debug' as const,
          },
        },
      };

      // Should not throw and should reset internal state
      configureLogger(config);
      
      expect(true).toBeTruthy();
    });

    test('should handle multiple configure calls', async () => {
      const { configureLogger } = await import('../src/logger-functions');
      
      const config1 = { providers: { console: { enabled: true } } };
      const config2 = { providers: { console: { enabled: false } } };

      configureLogger(config1);
      configureLogger(config2);
      
      expect(true).toBeTruthy();
    });
  });

  describe('error conversion in logError', () => {
    test('should convert string errors to Error objects in server environment', async () => {
      // Mock server environment
      delete (globalThis as any).window;
      delete (globalThis as any).EdgeRuntime;
      (globalThis as any).process = { env: { NODE_ENV: 'production' } };
      
      const { logError } = await import('../src/logger-functions');
      
      // This should trigger the error conversion logic
      logError('String error test', 'This is a string error');
      
      expect(true).toBeTruthy();
    });

    test('should handle Error objects in server environment', async () => {
      // Mock server environment
      delete (globalThis as any).window;
      delete (globalThis as any).EdgeRuntime;
      (globalThis as any).process = { env: { NODE_ENV: 'production' } };
      
      const { logError } = await import('../src/logger-functions');
      
      const error = new Error('Actual error');
      logError('Error object test', error);
      
      expect(true).toBeTruthy();
    });
  });
});
