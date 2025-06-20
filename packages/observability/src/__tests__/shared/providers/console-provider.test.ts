import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { ConsoleProvider } from '../../../shared/providers/console-provider';

describe('consoleProvider', () => {
  let provider: ConsoleProvider;
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;
  let consoleInfoSpy: any;

  beforeEach(async () => {
    // Mock console methods
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    provider = new ConsoleProvider();
    await provider.initialize({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('log', () => {
    test('should log info level messages to console.info', async () => {
      await provider.log('info', 'Test info message');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[OBS] INFO:', 'Test info message', '');
    });

    test('should log warn level messages to console.warn', async () => {
      await provider.log('warn', 'Test warning');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[OBS] WARN:', 'Test warning', '');
    });

    test('should log error level messages to console.error', async () => {
      await provider.log('error', 'Test error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[OBS] ERROR:', 'Test error', '');
    });

    test('should log debug level messages to console.log', async () => {
      await provider.log('debug', 'Test debug');

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] DEBUG:', 'Test debug', '');
    });

    test('should include metadata when provided', async () => {
      await provider.log('info', 'Test with metadata', {
        action: 'login',
        userId: '123',
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith('[OBS] INFO:', 'Test with metadata', {
        action: 'login',
        userId: '123',
      });
    });

    test('should handle different log levels', async () => {
      const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

      for (const level of levels) {
        consoleInfoSpy.mockClear();
        consoleLogSpy.mockClear();
        consoleWarnSpy.mockClear();
        consoleErrorSpy.mockClear();

        await provider.log(level, `Test ${level}`, {});

        // At least one console method should have been called
        const anyCalled =
          consoleInfoSpy.mock.calls.length > 0 ||
          consoleLogSpy.mock.calls.length > 0 ||
          consoleWarnSpy.mock.calls.length > 0 ||
          consoleErrorSpy.mock.calls.length > 0;
        expect(anyCalled).toBeTruthy();
      }
    });
  });

  describe('captureException', () => {
    test('should log exceptions to console.error', async () => {
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:123';

      await provider.captureException(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[OBS] Exception captured:',
        expect.objectContaining({
          name: 'Error',
          message: 'Test exception',
          stack: error.stack,
        }),
      );
    });

    test('should include context when provided', async () => {
      const error = new Error('Test error');
      const context = {
        action: 'login',
        userId: '123',
      };

      await provider.captureException(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[OBS] Exception captured:',
        expect.objectContaining({
          context: expect.objectContaining({
            action: 'login',
            userId: '123',
          }),
        }),
      );
    });
  });

  describe('captureMessage', () => {
    test('should log info messages', async () => {
      await provider.captureMessage('Info message', 'info');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          level: 'info',
          message: 'Info message',
        }),
      );
    });

    test('should log warning messages', async () => {
      await provider.captureMessage('Warning message', 'warning');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          level: 'warning',
          message: 'Warning message',
        }),
      );
    });

    test('should log error messages', async () => {
      await provider.captureMessage('Error message', 'error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          level: 'error',
          message: 'Error message',
        }),
      );
    });
  });

  describe('setUser', () => {
    test('should log user setting', () => {
      provider.setUser({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] User set:', {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });
    });
  });

  describe('setTag', () => {
    test('should log tag setting', () => {
      provider.setTag('environment', 'production');

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] Tag set:', {
        key: 'environment',
        value: 'production',
      });
    });
  });

  describe('setExtra', () => {
    test('should log extra data setting', () => {
      provider.setExtra('version', '1.0.0');

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] Extra set:', {
        key: 'version',
        value: '1.0.0',
      });
    });
  });

  describe('setContext', () => {
    test('should log context setting', () => {
      provider.setContext('app', {
        environment: 'production',
        version: '1.0.0',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] Context set:', {
        context: {
          environment: 'production',
          version: '1.0.0',
        },
        key: 'app',
      });
    });
  });

  describe('addBreadcrumb', () => {
    test('should log breadcrumb', () => {
      provider.addBreadcrumb({
        category: 'ui',
        level: 'info',
        message: 'User clicked button',
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('[OBS] Breadcrumb:', {
        category: 'ui',
        level: 'info',
        message: 'User clicked button',
      });
    });
  });

  describe('startTransaction', () => {
    test('should log transaction start and finish', () => {
      const transaction = provider.startTransaction('test-transaction');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Transaction started:',
        expect.objectContaining({
          name: 'test-transaction',
        }),
      );

      consoleLogSpy.mockClear();
      transaction.finish();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Transaction finished:',
        expect.objectContaining({
          name: 'test-transaction',
        }),
      );
    });
  });

  describe('startSpan', () => {
    test('should log span start and finish', () => {
      const span = provider.startSpan('test-span');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Span started:',
        expect.objectContaining({
          name: 'test-span',
        }),
      );

      consoleLogSpy.mockClear();
      span.finish();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Span finished:',
        expect.objectContaining({
          name: 'test-span',
        }),
      );
    });
  });

  describe('session management', () => {
    test('should log session start', () => {
      provider.startSession();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Session started',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });

    test('should log session end', () => {
      provider.endSession();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[OBS] Session ended',
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('disabled state', () => {
    test('should not log when disabled', async () => {
      const disabledProvider = new ConsoleProvider();
      await disabledProvider.initialize({ enabled: false });

      // Clear any initialization logs
      consoleLogSpy.mockClear();

      await disabledProvider.log('info', 'Should not be logged');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });
  });
});
