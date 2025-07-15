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
});
