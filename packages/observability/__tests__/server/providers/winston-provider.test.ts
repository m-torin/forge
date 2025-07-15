import { beforeEach, describe, expect, test, vi } from 'vitest';
import { WinstonProvider } from '../../../src/server/providers/winston-provider';
import type { ObservabilityContext, ObservabilityProviderConfig } from '../../../src/shared/types/types';

describe('WinstonProvider', () => {
  let provider: WinstonProvider;
  let consoleSpy: any;

  beforeEach(() => {
    provider = new WinstonProvider();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('basic properties', () => {
    test('should have correct name', () => {
      expect(provider.name).toBe('winston');
    });

    test('should start as not initialized', () => {
      expect(provider['isInitialized']).toBe(false);
    });
  });

  describe('initialize', () => {
    test('should initialize with config', async () => {
      const config: ObservabilityProviderConfig = {
        apiKey: 'test-key',
        environment: 'test',
      };

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Initializing with config:', config);
    });

    test('should initialize with empty config', async () => {
      const config: ObservabilityProviderConfig = {};

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Initializing with config:', config);
    });

    test('should initialize with complex config', async () => {
      const config: ObservabilityProviderConfig = {
        apiKey: 'test-key',
        environment: 'production',
        debug: true,
        tags: {
          service: 'test-service',
          version: '1.0.0',
        },
      };

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Initializing with config:', config);
    });
  });

  describe('captureException', () => {
    test('should throw error when initialized', async () => {
      await provider.initialize({});

      const error = new Error('Test error');
      const context: ObservabilityContext = {
        userId: 'test-user',
        tags: { component: 'auth' },
      };

      await expect(provider.captureException(error, context)).rejects.toThrow(
        '[Winston] Logging exception: Error: Test error - Context: {"userId":"test-user","tags":{"component":"auth"}}'
      );
    });

    test('should throw error when initialized without context', async () => {
      await provider.initialize({});

      const error = new Error('Test error');

      await expect(provider.captureException(error)).rejects.toThrow(
        '[Winston] Logging exception: Error: Test error - Context: undefined'
      );
    });

    test('should return early when not initialized', async () => {
      const error = new Error('Test error');

      await expect(provider.captureException(error)).resolves.toBeUndefined();
    });

    test('should handle complex context', async () => {
      await provider.initialize({});

      const error = new Error('Complex error');
      const context: ObservabilityContext = {
        userId: 'user123',
        sessionId: 'session123',
        requestId: 'req123',
        tags: {
          component: 'payment',
          action: 'process',
        },
        extra: {
          amount: 100,
          currency: 'USD',
        },
        level: 'error',
        fingerprint: ['payment', 'error'],
      };

      await expect(provider.captureException(error, context)).rejects.toThrow(
        '[Winston] Logging exception: Error: Complex error - Context: {"userId":"user123","sessionId":"session123","requestId":"req123","tags":{"component":"payment","action":"process"},"extra":{"amount":100,"currency":"USD"},"level":"error","fingerprint":["payment","error"]}'
      );
    });
  });

  describe('captureMessage', () => {
    test('should log message with info level when initialized', async () => {
      await provider.initialize({});

      const message = 'Test message';
      const context: ObservabilityContext = {
        userId: 'test-user',
        tags: { component: 'auth' },
      };

      await provider.captureMessage(message, 'info', context);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context,
        level: 'info',
        message,
      });
    });

    test('should log message with error level when initialized', async () => {
      await provider.initialize({});

      const message = 'Error message';
      const context: ObservabilityContext = {
        userId: 'test-user',
        tags: { component: 'database' },
      };

      await provider.captureMessage(message, 'error', context);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context,
        level: 'error',
        message,
      });
    });

    test('should log message with warning level when initialized', async () => {
      await provider.initialize({});

      const message = 'Warning message';
      const context: ObservabilityContext = {
        userId: 'test-user',
        tags: { component: 'api' },
      };

      await provider.captureMessage(message, 'warning', context);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context,
        level: 'warning',
        message,
      });
    });

    test('should log message without context when initialized', async () => {
      await provider.initialize({});

      const message = 'Simple message';

      await provider.captureMessage(message, 'info');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context: undefined,
        level: 'info',
        message,
      });
    });

    test('should return early when not initialized', async () => {
      const message = 'Test message';

      await expect(provider.captureMessage(message, 'info')).resolves.toBeUndefined();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should handle complex context in message', async () => {
      await provider.initialize({});

      const message = 'Complex message';
      const context: ObservabilityContext = {
        userId: 'user123',
        sessionId: 'session123',
        requestId: 'req123',
        tags: {
          component: 'notification',
          type: 'email',
        },
        extra: {
          recipient: 'user@example.com',
          template: 'welcome',
        },
        level: 'info',
        fingerprint: ['notification', 'email'],
      };

      await provider.captureMessage(message, 'info', context);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context,
        level: 'info',
        message,
      });
    });
  });

  describe('log', () => {
    test('should log with different levels when initialized', async () => {
      await provider.initialize({});

      // Test info level
      await provider.log('info', 'Info message', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Info message', { data: 'test' });

      // Test error level
      await provider.log('error', 'Error message', { error: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] error:', 'Error message', { error: 'test' });

      // Test debug level
      await provider.log('debug', 'Debug message', { debug: true });
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] debug:', 'Debug message', { debug: true });

      // Test warn level
      await provider.log('warn', 'Warning message', { warning: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith('[Winston] warn:', 'Warning message', { warning: 'test' });
    });

    test('should log without metadata when initialized', async () => {
      await provider.initialize({});

      await provider.log('info', 'Simple message');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Simple message', undefined);
    });

    test('should return early when not initialized', async () => {
      await expect(provider.log('info', 'Test message')).resolves.toBeUndefined();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should handle complex metadata', async () => {
      await provider.initialize({});

      const metadata = {
        userId: 'user123',
        action: 'login',
        timestamp: new Date().toISOString(),
        details: {
          ip: '127.0.0.1',
          userAgent: 'test-agent',
        },
        nested: {
          level1: {
            level2: {
              value: 'deep-value',
            },
          },
        },
      };

      await provider.log('info', 'Complex log message', metadata);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Complex log message', metadata);
    });

    test('should handle null metadata', async () => {
      await provider.initialize({});

      await provider.log('info', 'Message with null metadata', null);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Message with null metadata', null);
    });

    test('should handle empty string metadata', async () => {
      await provider.initialize({});

      await provider.log('info', 'Message with empty string metadata', '');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Message with empty string metadata', '');
    });

    test('should handle array metadata', async () => {
      await provider.initialize({});

      const metadata = ['item1', 'item2', { key: 'value' }];

      await provider.log('info', 'Message with array metadata', metadata);

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] info:', 'Message with array metadata', metadata);
    });
  });

  describe('error handling', () => {
    test('should handle initialization multiple times', async () => {
      const config1 = { apiKey: 'key1' };
      const config2 = { apiKey: 'key2' };

      await provider.initialize(config1);
      expect(provider['isInitialized']).toBe(true);

      await provider.initialize(config2);
      expect(provider['isInitialized']).toBe(true);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenNthCalledWith(1, '[Winston] Initializing with config:', config1);
      expect(consoleSpy).toHaveBeenNthCalledWith(2, '[Winston] Initializing with config:', config2);
    });

    test('should handle empty string messages', async () => {
      await provider.initialize({});

      await provider.captureMessage('', 'info');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context: undefined,
        level: 'info',
        message: '',
      });
    });

    test('should handle long messages', async () => {
      await provider.initialize({});

      const longMessage = 'A'.repeat(1000);

      await provider.captureMessage(longMessage, 'info');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context: undefined,
        level: 'info',
        message: longMessage,
      });
    });

    test('should handle special characters in messages', async () => {
      await provider.initialize({});

      const specialMessage = 'Message with special chars: "quotes", \'apostrophes\', and unicode: 🚀';

      await provider.captureMessage(specialMessage, 'info');

      expect(consoleSpy).toHaveBeenCalledWith('[Winston] Logging message:', {
        context: undefined,
        level: 'info',
        message: specialMessage,
      });
    });
  });
});