import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PinoProvider } from '../../../src/server/providers/pino-provider';
import type { ObservabilityContext, ObservabilityProviderConfig } from '../../../src/shared/types/types';
import type { LogEntry } from '../../../src/shared/types/logger-types';

// Mock pino module
vi.mock('pino', () => ({
  default: vi.fn(),
}));

// Mock environment
vi.mock('../../../src/shared/utils/environment', () => ({
  Environment: {
    isDevelopment: vi.fn(),
  },
}));

describe('PinoProvider', () => {
  let provider: PinoProvider;
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock console methods
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
    
    // Add child method to console to simulate pino behavior
    (console as any).child = vi.fn().mockReturnValue(console);
    (console as any).flush = vi.fn();
    
    provider = new PinoProvider();
  });

  afterEach(() => {
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('basic properties', () => {
    test('should have correct name', () => {
      expect(provider.name).toBe('pino');
    });

    test('should be enabled by default', () => {
      expect(provider.isEnabled()).toBe(true);
    });
  });

  describe('constructor', () => {
    test('should create provider with default options', () => {
      const provider = new PinoProvider();
      expect(provider.name).toBe('pino');
    });

    test('should create provider with custom options', () => {
      const options = {
        level: 'debug',
        prettyPrint: true,
      };
      
      const provider = new PinoProvider(options);
      expect(provider.name).toBe('pino');
    });

    test('should create provider with empty options', () => {
      const provider = new PinoProvider({});
      expect(provider.name).toBe('pino');
    });
  });

  describe('initialize', () => {
    test('should initialize successfully', async () => {
      const config: ObservabilityProviderConfig = {
        apiKey: 'test-key',
        environment: 'test',
      };

      await provider.initialize(config);
      
      // Should complete without error
      expect(true).toBeTruthy();
    });

    test('should initialize with empty config', async () => {
      await provider.initialize({});
      
      // Should complete without error
      expect(true).toBeTruthy();
    });
  });

  describe('logEntry', () => {
    test('should log debug entry', async () => {
      const entry: LogEntry = {
        level: 'debug',
        message: 'Debug message',
        metadata: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      // Should use console fallback initially
      expect(consoleSpy.debug).toHaveBeenCalledWith({ test: 'data' }, 'Debug message');
    });

    test('should log info entry', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Info message',
        metadata: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith({ test: 'data' }, 'Info message');
    });

    test('should log warn entry', async () => {
      const entry: LogEntry = {
        level: 'warn',
        message: 'Warn message',
        metadata: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.warn).toHaveBeenCalledWith({ test: 'data' }, 'Warn message');
    });

    test('should log error entry', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Error message',
        metadata: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.error).toHaveBeenCalledWith({ test: 'data' }, 'Error message');
    });

    test('should log unknown level as info', async () => {
      const entry: LogEntry = {
        level: 'unknown' as any,
        message: 'Unknown level message',
        metadata: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith({ test: 'data' }, 'Unknown level message');
    });

    test('should handle entry without metadata', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Message without metadata',
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message without metadata');
    });

    test('should handle entry with empty metadata', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Message with empty metadata',
        metadata: {},
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message with empty metadata');
    });

    test('should handle entry with complex metadata', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Message with complex metadata',
        metadata: {
          user: { id: 'user123', name: 'Test User' },
          request: { method: 'GET', url: '/api/test' },
          nested: { deep: { value: 'test' } },
        },
        timestamp: new Date().toISOString(),
      };

      await provider.logEntry(entry);

      expect(consoleSpy.info).toHaveBeenCalledWith({
        user: { id: 'user123', name: 'Test User' },
        request: { method: 'GET', url: '/api/test' },
        nested: { deep: { value: 'test' } },
      }, 'Message with complex metadata');
    });
  });

  describe('log', () => {
    test('should log with different levels', async () => {
      await provider.log('debug', 'Debug message', { test: 'data' });
      expect(consoleSpy.debug).toHaveBeenCalledWith({ test: 'data' }, 'Debug message');

      await provider.log('info', 'Info message', { test: 'data' });
      expect(consoleSpy.info).toHaveBeenCalledWith({ test: 'data' }, 'Info message');

      await provider.log('warn', 'Warn message', { test: 'data' });
      expect(consoleSpy.warn).toHaveBeenCalledWith({ test: 'data' }, 'Warn message');

      await provider.log('error', 'Error message', { test: 'data' });
      expect(consoleSpy.error).toHaveBeenCalledWith({ test: 'data' }, 'Error message');
    });

    test('should handle log without metadata', async () => {
      await provider.log('info', 'Message without metadata');
      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message without metadata');
    });

    test('should handle log with null metadata', async () => {
      await provider.log('info', 'Message with null metadata', null);
      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message with null metadata');
    });

    test('should handle log with empty string metadata', async () => {
      await provider.log('info', 'Message with empty metadata', '');
      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message with empty metadata');
    });
  });

  describe('captureMessage', () => {
    test('should capture info message', async () => {
      const message = 'Info message';
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'test' },
      };

      await provider.captureMessage(message, 'info', context);

      expect(consoleSpy.info).toHaveBeenCalledWith({
        userId: 'user123',
        tags: { component: 'test' },
      }, message);
    });

    test('should capture error message', async () => {
      const message = 'Error message';
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'test' },
      };

      await provider.captureMessage(message, 'error', context);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        userId: 'user123',
        tags: { component: 'test' },
      }, message);
    });

    test('should capture warning message as warn', async () => {
      const message = 'Warning message';
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'test' },
      };

      await provider.captureMessage(message, 'warning', context);

      expect(consoleSpy.warn).toHaveBeenCalledWith({
        userId: 'user123',
        tags: { component: 'test' },
      }, message);
    });

    test('should capture message without context', async () => {
      await provider.captureMessage('Message without context', 'info');

      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message without context');
    });

    test('should capture message with empty context', async () => {
      await provider.captureMessage('Message with empty context', 'info', {});

      expect(consoleSpy.info).toHaveBeenCalledWith({}, 'Message with empty context');
    });

    test('should capture message with complex context', async () => {
      const context: ObservabilityContext = {
        userId: 'user123',
        sessionId: 'session123',
        requestId: 'req123',
        tags: { component: 'auth', action: 'login' },
        extra: { ip: '127.0.0.1', userAgent: 'test-agent' },
        level: 'info',
        fingerprint: ['auth', 'login'],
      };

      await provider.captureMessage('Complex message', 'info', context);

      expect(consoleSpy.info).toHaveBeenCalledWith(context, 'Complex message');
    });
  });

  describe('captureException', () => {
    test('should capture Error object', async () => {
      const error = new Error('Test error');
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'test' },
      };

      await provider.captureException(error, context);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: error,
        userId: 'user123',
        tags: { component: 'test' },
      }, 'Test error');
    });

    test('should capture string error', async () => {
      const error = 'String error';
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'test' },
      };

      await provider.captureException(error, context);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: error,
        userId: 'user123',
        tags: { component: 'test' },
      }, 'String error');
    });

    test('should capture exception without context', async () => {
      const error = new Error('Test error');

      await provider.captureException(error);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: error,
      }, 'Test error');
    });

    test('should handle object without message', async () => {
      const error = { code: 'ERR_TEST' };

      await provider.captureException(error);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: error,
      }, 'Unknown error');
    });

    test('should handle null error', async () => {
      await provider.captureException(null);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: null,
      }, 'Unknown error');
    });

    test('should handle undefined error', async () => {
      await provider.captureException(undefined);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: undefined,
      }, 'Unknown error');
    });

    test('should handle error object with message property', async () => {
      const error = { message: 'Custom error message', code: 'ERR_CUSTOM' };

      await provider.captureException(error);

      expect(consoleSpy.error).toHaveBeenCalledWith({
        err: error,
      }, 'Custom error message');
    });
  });

  describe('identify', () => {
    test('should identify user without traits', async () => {
      await provider.identify('user123');

      // Should have created a child logger
      expect((console as any).child).toHaveBeenCalledWith({
        userId: 'user123',
      });
    });

    test('should identify user with traits', async () => {
      const traits = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      };

      await provider.identify('user123', traits);

      expect((console as any).child).toHaveBeenCalledWith({
        userId: 'user123',
        user: traits,
      });
    });

    test('should identify user with empty traits', async () => {
      await provider.identify('user123', {});

      expect((console as any).child).toHaveBeenCalledWith({
        userId: 'user123',
        user: {},
      });
    });

    test('should identify user with complex traits', async () => {
      const traits = {
        name: 'Test User',
        profile: {
          age: 30,
          preferences: {
            theme: 'dark',
            language: 'en',
          },
        },
        permissions: ['read', 'write'],
      };

      await provider.identify('user123', traits);

      expect((console as any).child).toHaveBeenCalledWith({
        userId: 'user123',
        user: traits,
      });
    });
  });

  describe('setContext', () => {
    test('should set context on main logger', async () => {
      const context = { requestId: 'req123' };

      provider.setContext('request', context);

      expect((console as any).child).toHaveBeenCalledWith({
        request: context,
      });
    });

    test('should set context on child logger', async () => {
      // First identify a user to create child logger
      await provider.identify('user123');
      
      const context = { requestId: 'req123' };

      provider.setContext('request', context);

      expect((console as any).child).toHaveBeenCalledWith({
        request: context,
      });
    });

    test('should set context with empty object', async () => {
      provider.setContext('empty', {});

      expect((console as any).child).toHaveBeenCalledWith({
        empty: {},
      });
    });

    test('should set context with complex object', async () => {
      const context = {
        request: {
          method: 'POST',
          url: '/api/test',
          headers: { 'content-type': 'application/json' },
        },
        response: {
          status: 200,
          duration: 150,
        },
      };

      provider.setContext('api', context);

      expect((console as any).child).toHaveBeenCalledWith({
        api: context,
      });
    });
  });

  describe('flush', () => {
    test('should flush with logger that supports flush', async () => {
      (console as any).flush.mockImplementation((callback: any) => {
        callback();
      });

      await provider.flush();

      expect((console as any).flush).toHaveBeenCalled();
    });

    test('should flush with custom timeout', async () => {
      (console as any).flush.mockImplementation((callback: any) => {
        setTimeout(() => callback(), 100);
      });

      await provider.flush(2000);

      expect((console as any).flush).toHaveBeenCalled();
    });

    test('should handle flush timeout', async () => {
      (console as any).flush.mockImplementation((callback: any) => {
        // Never call callback to simulate timeout
      });

      const startTime = Date.now();
      await provider.flush(100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    test('should handle flush error', async () => {
      (console as any).flush.mockImplementation((callback: any) => {
        callback(new Error('Flush error'));
      });

      await provider.flush();

      expect((console as any).flush).toHaveBeenCalled();
    });

    test('should handle logger without flush method', async () => {
      // Remove flush method
      delete (console as any).flush;

      await provider.flush();

      // Should complete without error
      expect(true).toBeTruthy();
    });
  });

  describe('async pino initialization', () => {
    test('should handle provider creation successfully', async () => {
      // Provider should be created successfully
      expect(provider).toBeDefined();
      expect(provider.name).toBe('pino');
      expect(provider.isEnabled()).toBe(true);
    });

    test('should work with console fallback', async () => {
      // Provider should work with console fallback
      expect(provider).toBeDefined();
      
      // Should complete without error
      await provider.initialize({});
      
      expect(provider.isEnabled()).toBe(true);
    });
  });
});