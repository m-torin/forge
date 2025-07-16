import { ConsoleProvider } from '@/shared/providers/console-provider';
import { Breadcrumb, ObservabilityContext } from '@/shared/types/types';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

describe('consoleProvider', () => {
  let provider: ConsoleProvider;

  beforeEach(() => {
    provider = new ConsoleProvider();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    test('should initialize with correct name', () => {
      expect(provider.name).toBe('console');
    });

    test('should initialize with custom config', async () => {
      const config = {
        enabled: true,
        prefix: '[CUSTOM]',
        colors: true,
        timestamp: true,
      };

      await provider.initialize(config);
      expect(console.log).toHaveBeenCalledWith('[CUSTOM] Console provider initialized', {
        colors: true,
        levels: undefined,
        timestamp: true,
      });
    });

    test('should initialize with log levels config', async () => {
      const config = {
        enabled: true,
        levels: ['error', 'warn', 'info'],
      };

      await provider.initialize(config);
      expect(console.log).toHaveBeenCalledWith('[OBS] Console provider initialized', {
        colors: undefined,
        levels: ['error', 'warn', 'info'],
        timestamp: undefined,
      });
    });
  });

  describe('addBreadcrumb', () => {
    test('should add breadcrumb and log it', () => {
      const breadcrumb: Breadcrumb = {
        message: 'User clicked button',
        category: 'ui',
        level: 'info',
        timestamp: Date.now(),
      };

      provider.addBreadcrumb(breadcrumb);

      expect(console.log).toHaveBeenCalledWith('[OBS] Breadcrumb:', breadcrumb);
    });

    test('should limit breadcrumbs to max', () => {
      // Add more than max breadcrumbs
      for (let i = 0; i < 110; i++) {
        provider.addBreadcrumb({
          message: `Breadcrumb ${i}`,
          category: 'test',
          level: 'info',
          timestamp: Date.now(),
        });
      }

      // Should still log the last one
      expect(console.log).toHaveBeenCalledWith('[OBS] Breadcrumb:', expect.objectContaining({
        message: 'Breadcrumb 109',
      }));
    });

    test('should not add breadcrumb when disabled', async () => {
      // Create a new provider with disabled config
      const disabledProvider = new ConsoleProvider();
      await disabledProvider.initialize({ enabled: false });

      const breadcrumb: Breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info',
        timestamp: Date.now(),
      };

      disabledProvider.addBreadcrumb(breadcrumb);

      // Should not have any breadcrumb logs
      const breadcrumbCalls = (console.log as any).mock.calls.filter(
        (call: any[]) => call[0] === '[OBS] Breadcrumb:',
      );
      expect(breadcrumbCalls).toHaveLength(0);
    });
  });

  describe('captureException', () => {
    test('should capture exception with breadcrumbs', async () => {
      // Add some breadcrumbs first
      provider.addBreadcrumb({
        message: 'Before error',
        category: 'action',
        level: 'info',
        timestamp: Date.now(),
      });

      const error = new Error('Test error');
      await provider.captureException(error);

      expect(console.error).toHaveBeenCalledWith('[OBS] Exception captured:', expect.objectContaining({
        name: 'Error',
        message: 'Test error',
        stack: expect.any(String),
        breadcrumbs: expect.arrayContaining([
          expect.objectContaining({
            message: 'Before error',
          }),
        ]),
      }));
    });

    test('should capture exception with context', async () => {
      const error = new Error('Test error');
      const context = { userId: '123', operation: 'test' };

      await provider.captureException(error, context);

      expect(console.error).toHaveBeenCalledWith('[OBS] Exception captured:', expect.objectContaining({
        context: expect.objectContaining({
          userId: '123',
          operation: 'test',
        }),
      }));
    });

    test('should include recent breadcrumbs in exception', async () => {
      // Add some breadcrumbs
      for (let i = 0; i < 15; i++) {
        provider.addBreadcrumb({
          message: `Breadcrumb ${i}`,
          category: 'test',
          level: 'info',
          timestamp: Date.now(),
        });
      }

      const error = new Error('Test error');
      await provider.captureException(error);

      expect(console.error).toHaveBeenCalledWith(
        '[OBS] Exception captured:',
        expect.objectContaining({
          breadcrumbs: expect.arrayContaining([
            expect.objectContaining({ message: expect.stringMatching(/Breadcrumb \d+/) }),
          ]),
        }),
      );
    });

    test('should handle non-Error objects', async () => {
      const errorString = 'String error';
      await provider.captureException(errorString as any);

      expect(console.error).toHaveBeenCalledWith(
        '[OBS] Exception captured:',
        expect.objectContaining({
          message: 'Unknown error',
        }),
      );
    });

    test('should handle disabled provider', async () => {
      // Create a new provider with disabled config
      const disabledProvider = new ConsoleProvider();
      await disabledProvider.initialize({ enabled: false });

      const error = new Error('Test error');
      await disabledProvider.captureException(error);

      // Should not have called console.error since it's disabled
      const errorCalls = (console.error as any).mock.calls.filter(
        (call: any[]) => call[0] === '[OBS] Exception captured:',
      );
      expect(errorCalls).toHaveLength(0);
    });
  });

  describe('captureMessage', () => {
    test('should capture message with context', async () => {
      const context = { userId: '123' };

      await provider.captureMessage('Test message', 'info', context);

      expect(console.info).toHaveBeenCalledWith('[OBS] Message:', expect.objectContaining({
        message: 'Test message',
        level: 'info',
        context: expect.objectContaining({
          userId: '123',
        }),
      }));
    });

    test('should capture and log message with info level', async () => {
      const message = 'Test message';
      const context: ObservabilityContext = {
        tags: { environment: 'test' },
        extra: { requestId: 'req-123' },
      };

      await provider.captureMessage(message, 'info', context);

      expect(console.info).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          message: 'Test message',
          level: 'info',
          context: expect.objectContaining({
            user: null,
            tags: { environment: 'test' },
            extra: { requestId: 'req-123' },
            contexts: {},
          }),
          timestamp: expect.any(String),
        }),
      );
    });

    test('should use console.warn for warning level', async () => {
      await provider.captureMessage('Warning message', 'warning');

      expect(console.warn).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          message: 'Warning message',
          level: 'warning',
        }),
      );
    });

    test('should use console.error for error level', async () => {
      await provider.captureMessage('Error message', 'error');

      expect(console.error).toHaveBeenCalledWith(
        '[OBS] Message:',
        expect.objectContaining({
          message: 'Error message',
          level: 'error',
        }),
      );
    });

    test('should not capture message when disabled', async () => {
      await provider.initialize({ enabled: false });

      await provider.captureMessage('Test message', 'info');

      // Should not have any console calls after initialization
      expect(console.info).not.toHaveBeenCalled();
    });
  });

  describe('log method', () => {
    test('should log with different levels', async () => {
      await provider.log('debug', 'Debug message');
      await provider.log('info', 'Info message');
      await provider.log('warn', 'Warning message');
      await provider.log('error', 'Error message');

      expect(console.log).toHaveBeenCalledWith('[OBS] DEBUG:', 'Debug message', '');
      expect(console.info).toHaveBeenCalledWith('[OBS] INFO:', 'Info message', '');
      expect(console.warn).toHaveBeenCalledWith('[OBS] WARN:', 'Warning message', '');
      expect(console.error).toHaveBeenCalledWith('[OBS] ERROR:', 'Error message', '');
    });

    test('should log with metadata', async () => {
      const metadata = { userId: '123', operation: 'test' };

      await provider.log('info', 'Message with metadata', metadata);

      expect(console.info).toHaveBeenCalledWith('[OBS] INFO:', 'Message with metadata', metadata);
    });

    test('should respect log levels filter', async () => {
      // Initialize with specific levels
      await provider.initialize({
        enabled: true,
        levels: ['error', 'warn'],
      });

      await provider.log('debug', 'Debug message');
      await provider.log('info', 'Info message');
      await provider.log('warn', 'Warning message');
      await provider.log('error', 'Error message');

      // Only warn and error should be logged
      expect(console.log).not.toHaveBeenCalledWith('[OBS] DEBUG:', 'Debug message', '');
      expect(console.info).not.toHaveBeenCalledWith('[OBS] INFO:', 'Info message', '');
      expect(console.warn).toHaveBeenCalledWith('[OBS] WARN:', 'Warning message', '');
      expect(console.error).toHaveBeenCalledWith('[OBS] ERROR:', 'Error message', '');
    });

    test('should handle all log level mappings', async () => {
      await provider.log('trace', 'Trace message');
      await provider.log('fatal', 'Fatal message');
      await provider.log('warning', 'Warning message');
      await provider.log('unknown', 'Unknown level message');

      expect(console.log).toHaveBeenCalledWith('[OBS] TRACE:', 'Trace message', '');
      expect(console.error).toHaveBeenCalledWith('[OBS] FATAL:', 'Fatal message', '');
      expect(console.warn).toHaveBeenCalledWith('[OBS] WARNING:', 'Warning message', '');
      expect(console.log).toHaveBeenCalledWith('[OBS] UNKNOWN:', 'Unknown level message', '');
    });
  });

  describe('context management', () => {
    test('should set and merge context', () => {
      provider.setContext('user', { id: '123', name: 'John' });
      provider.setContext('session', { id: 'abc' });

      const breadcrumb: Breadcrumb = {
        message: 'Test',
        category: 'test',
        level: 'info',
        timestamp: Date.now(),
      };

      provider.addBreadcrumb(breadcrumb);

      expect(console.log).toHaveBeenCalledWith('[OBS] Breadcrumb:', breadcrumb);
    });

    test('should set extra data', () => {
      provider.setExtra('buildVersion', '1.0.0');
      provider.setExtra('environment', 'production');

      expect(console.log).toHaveBeenCalledWith('[OBS] Extra set:', {
        key: 'buildVersion',
        value: '1.0.0',
      });
      expect(console.log).toHaveBeenCalledWith('[OBS] Extra set:', {
        key: 'environment',
        value: 'production',
      });
    });

    test('should set tags', () => {
      provider.setTag('component', 'auth');
      provider.setTag('version', '2.0.0');

      expect(console.log).toHaveBeenCalledWith('[OBS] Tag set:', {
        key: 'component',
        value: 'auth',
      });
      expect(console.log).toHaveBeenCalledWith('[OBS] Tag set:', {
        key: 'version',
        value: '2.0.0',
      });
    });

    test('should set user info', () => {
      const user = { id: '123', email: 'test@example.com' };
      provider.setUser(user);

      expect(console.log).toHaveBeenCalledWith('[OBS] User set:', user);
    });

    test('should set and merge user context', async () => {
      const user = { id: '123', email: 'test@example.com', name: 'Test User' };
      provider.setUser(user);

      const context: ObservabilityContext = {
        extra: { requestId: 'req-123' },
      };

      await provider.captureException(new Error('Test'), context);

      expect(console.error).toHaveBeenCalledWith(
        '[OBS] Exception captured:',
        expect.objectContaining({
          context: expect.objectContaining({
            user: user,
            extra: { requestId: 'req-123' },
            contexts: {},
            tags: {},
          }),
        }),
      );
    });

    test('should set tags', () => {
      provider.setTag('environment', 'test');

      expect(console.log).toHaveBeenCalledWith('[OBS] Tag set:', {
        key: 'environment',
        value: 'test',
      });
    });

    test('should set extra data', () => {
      provider.setExtra('requestId', 'req-123');

      expect(console.log).toHaveBeenCalledWith('[OBS] Extra set:', {
        key: 'requestId',
        value: 'req-123',
      });
    });

    test('should set context', () => {
      provider.setContext('request', { url: '/api/test', method: 'GET' });

      expect(console.log).toHaveBeenCalledWith('[OBS] Context set:', {
        key: 'request',
        context: { url: '/api/test', method: 'GET' },
      });
    });
  });

  describe('session management', () => {
    test('should start session', () => {
      provider.startSession();

      expect(console.log).toHaveBeenCalledWith('[OBS] Session started', {
        timestamp: expect.any(String),
        user: null,
      });
    });

    test('should end session', () => {
      provider.endSession();

      expect(console.log).toHaveBeenCalledWith('[OBS] Session ended', {
        timestamp: expect.any(String),
        user: null,
      });
    });
  });

  describe('performance monitoring', () => {
    test('should start and finish spans', () => {
      const span = provider.startSpan('test-span');

      expect(console.log).toHaveBeenCalledWith('[OBS] Span started:', {
        id: expect.any(String),
        name: 'test-span',
        parentId: undefined,
      });

      span.finish();

      expect(console.log).toHaveBeenCalledWith('[OBS] Span finished:', {
        id: expect.any(String),
        name: 'test-span',
        duration: expect.stringMatching(/\d+ms/),
      });
    });

    test('should start and finish transactions', () => {
      const transaction = provider.startTransaction('test-transaction');

      expect(console.log).toHaveBeenCalledWith('[OBS] Transaction started:', {
        id: expect.any(String),
        name: 'test-transaction',
        context: expect.any(Object),
      });

      transaction.finish();

      expect(console.log).toHaveBeenCalledWith('[OBS] Transaction finished:', {
        id: expect.any(String),
        name: 'test-transaction',
        duration: expect.stringMatching(/\d+ms/),
      });
    });
  });

  describe('disabled state', () => {
    test('should not log when disabled', async () => {
      await provider.initialize({ enabled: false });

      provider.addBreadcrumb({
        message: 'Test',
        category: 'test',
        level: 'info',
        timestamp: Date.now(),
      });

      await provider.captureException(new Error('Test'));
      await provider.captureMessage('Test message', 'info');
      await provider.log('info', 'Test log');
      provider.setContext('test', { value: 'test' });
      provider.setExtra('test', 'value');
      provider.setTag('test', 'value');
      provider.setUser({ id: '123' });

      // Should not have any console calls when disabled (no initialization log either)
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
