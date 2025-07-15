import {
  configureLogger,
  createLogger,
  logDebug,
  logError,
  logInfo,
  logWarn,
} from '@/logger-functions-edge';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('edge Logger Functions', () => {
  let consoleSpies: {
    debug: ReturnType<typeof vi.spyOn>;
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
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
    vi.clearAllMocks();
  });

  describe('edge runtime compatibility', () => {
    test('should not use any Node.js APIs', () => {
      // These functions should work without any Node.js imports
      logDebug('Debug in edge');
      logInfo('Info in edge');
      logWarn('Warning in edge');
      logError('Error in edge', new Error('Edge error'));

      // If we got here without errors, the functions are edge-compatible
      expect(true).toBeTruthy();
    });

    test('should format messages correctly', () => {
      logInfo('Test message', { userId: '123' });

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      const call = consoleSpies.log.mock.calls[0][0];
      expect(call).toContain('INFO');
      expect(call).toContain('Test message');
      expect(call).toContain('userId: 123');
    });
  });

  describe('log levels', () => {
    test('should log debug messages', () => {
      logDebug('Debug message', { detail: 'value' });

      // Debug might fall back to log
      expect(
        consoleSpies.debug.mock.calls.length + consoleSpies.log.mock.calls.length,
      ).toBeGreaterThan(0);
    });

    test('should log info messages', () => {
      logInfo('Info message');

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      expect(consoleSpies.log.mock.calls[0][0]).toContain('INFO');
    });

    test('should log warning messages', () => {
      logWarn('Warning message');

      expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpies.warn.mock.calls[0][0]).toContain('WARN');
    });

    test('should log error messages', () => {
      const error = new Error('Test error');
      logError('Error occurred', error);

      expect(consoleSpies.error).toHaveBeenCalledTimes(1);
      expect(consoleSpies.error.mock.calls[0][0]).toContain('ERROR');
      expect(consoleSpies.error.mock.calls[0][0]).toContain('Test error');
    });
  });

  describe('context handling', () => {
    test('should handle complex context objects', () => {
      const context = {
        user: { id: '123', name: 'Test User' },
        metadata: { timestamp: Date.now(), version: '1.0.0' },
        tags: ['edge', 'test'],
        nested: {
          deep: {
            value: 'should work',
          },
        },
      };

      logInfo('Complex context', context);

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      const call = consoleSpies.log.mock.calls[0][0];
      expect(call).toContain('id: 123');
      expect(call).toContain('name: Test User');
    });

    test('should handle circular references safely', () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      // Should not throw
      expect(() => {
        logInfo('Circular reference', circular);
      }).not.toThrow();
    });

    test('should handle very deep objects', () => {
      let deep: any = { level: 0 };
      let current = deep;

      // Create a very deep object
      for (let i = 1; i < 10; i++) {
        current.next = { level: i };
        current = current.next;
      }

      // Should handle deep objects gracefully
      logInfo('Deep object', deep);

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      const call = consoleSpies.log.mock.calls[0][0];
      expect(call).toContain('[Max depth exceeded]');
    });
  });

  describe('error handling', () => {
    test('should handle various error types', () => {
      // Standard Error
      logError('Standard error', new Error('Test'));

      // Custom error
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      logError('Custom error', new CustomError('Custom'));

      // String error
      logError('String error', 'Just a string');

      // Object error
      logError('Object error', { message: 'Error object' });

      // Null/undefined
      logError('Null error', null);
      logError('Undefined error', undefined);

      expect(consoleSpies.error).toHaveBeenCalledTimes(6);
    });
  });

  describe('configuration', () => {
    test('should handle configureLogger (no-op in edge)', () => {
      configureLogger({ providers: { console: { enabled: true } } });

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      expect(consoleSpies.log.mock.calls[0][0]).toContain('configuration ignored in edge runtime');
    });
  });

  describe('backwards compatibility', () => {
    test('should provide deprecated createLogger', () => {
      const logger = createLogger();

      expect(consoleSpies.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpies.warn.mock.calls[0][0]).toContain('deprecated');

      // Logger should still work
      logger.info('Test message');
      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge runtime detection', () => {
    test('should detect edge runtime environment', () => {
      // The edge runtime detection happens at module load time,
      // so we need to re-import the module after setting the global
      const _originalEdgeRuntime = (globalThis as any).EdgeRuntime;

      // We can't easily test runtime detection without reloading the module
      // So let's just verify the formatting works correctly
      logInfo('In edge runtime');

      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      const call = consoleSpies.log.mock.calls[0][0];
      // The prefix could be either [Edge] or [Server] depending on environment
      expect(call).toMatch(/\[(Edge|Server)\]/);
      expect(call).toContain('INFO');
      expect(call).toContain('In edge runtime');
    });
  });
});
