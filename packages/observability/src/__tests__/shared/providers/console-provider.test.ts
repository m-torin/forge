import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConsoleProvider } from '../../../shared/providers/console-provider';

import type { LogEntry } from '../../../shared/types/logger-types';

describe('ConsoleProvider', () => {
  let provider: ConsoleProvider;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleInfoSpy: any;
  let consoleDebugSpy: any;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    provider = new ConsoleProvider();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log', () => {
    it('should log info level messages to console.log', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test info message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Test info message');
    });

    it('should log warn level messages to console.warn', async () => {
      const entry: LogEntry = {
        level: 'warn',
        message: 'Test warning',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'Test warning');
    });

    it('should log error level messages to console.error', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test error');
    });

    it('should log debug level messages to console.debug', async () => {
      const entry: LogEntry = {
        level: 'debug',
        message: 'Test debug',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG]', 'Test debug');
    });

    it('should include metadata when provided', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test with metadata',
        metadata: {
          action: 'login',
          userId: '123',
        },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Test with metadata', {
        action: 'login',
        userId: '123',
      });
    });

    it('should not include metadata when not provided', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test without metadata',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(consoleLogSpy).toHaveBeenCalledWith('[INFO]', 'Test without metadata');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('captureException', () => {
    it('should log error with stack trace', async () => {
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:123';

      await provider.captureException(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test exception', error);
    });

    it('should include context when provided', async () => {
      const error = new Error('Test exception');
      const context = {
        endpoint: '/api/test',
        userId: '123',
      };

      await provider.captureException(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test exception', error, context);
    });

    it('should handle errors without stack traces', async () => {
      const error = new Error('Test exception');
      delete error.stack;

      await provider.captureException(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test exception', error);
    });

    it('should handle non-Error objects', async () => {
      const error = { code: 500, message: 'Custom error' };

      await provider.captureException(error as any);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Custom error', error);
    });

    it('should handle string errors', async () => {
      await provider.captureException('String error' as any);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'String error', 'String error');
    });
  });

  describe('identify', () => {
    it('should log user identification', async () => {
      await provider.identify('user-123', {
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('[IDENTIFY]', 'user-123', {
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should handle identification without traits', async () => {
      await provider.identify('user-456');

      expect(consoleLogSpy).toHaveBeenCalledWith('[IDENTIFY]', 'user-456');
    });
  });

  describe('setContext', () => {
    it('should log context setting', async () => {
      await provider.setContext({
        environment: 'production',
        version: '1.0.0',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('[CONTEXT]', {
        environment: 'production',
        version: '1.0.0',
      });
    });

    it('should handle empty context', async () => {
      await provider.setContext({});

      expect(consoleLogSpy).toHaveBeenCalledWith('[CONTEXT]', {});
    });
  });

  describe('flush', () => {
    it('should return immediately', async () => {
      const start = Date.now();
      await provider.flush();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // Should be near-instant
    });
  });

  describe('enabled state', () => {
    it('should be enabled in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const devProvider = new ConsoleProvider();
      expect(devProvider.isEnabled()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should be enabled in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const testProvider = new ConsoleProvider();
      expect(testProvider.isEnabled()).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should be disabled in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const prodProvider = new ConsoleProvider();
      expect(prodProvider.isEnabled()).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log when disabled', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const prodProvider = new ConsoleProvider();

      await prodProvider.log({
        level: 'info',
        message: 'Should not appear',
        timestamp: new Date().toISOString(),
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
