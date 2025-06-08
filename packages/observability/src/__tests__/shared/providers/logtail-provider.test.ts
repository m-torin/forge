import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LogtailProvider } from '../../../shared/providers/logtail-provider';

import type { LogEntry } from '../../../shared/types/logger-types';

// Mock the Logtail module
const mockLogtailClient = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  use: vi.fn(),
  warn: vi.fn(),
};

vi.mock('@logtail/node', () => ({
  Logtail: vi.fn().mockImplementation(() => mockLogtailClient),
}));

describe('LogtailProvider', () => {
  let provider: LogtailProvider;
  const mockToken = 'test-logtail-token';

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset all mock function calls
    Object.values(mockLogtailClient).forEach((fn) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        fn.mockClear();
      }
    });

    provider = new LogtailProvider();
    await provider.initialize({ sourceToken: mockToken });
  });

  describe('initialization', () => {
    it('should initialize with provided token', () => {
      expect(provider).toBeDefined();
      expect(provider.name).toBe('logtail');
    });

    it('should throw without token', async () => {
      const disabledProvider = new LogtailProvider();
      await expect(disabledProvider.initialize({ sourceToken: '' })).rejects.toThrow(
        'Logtail source token is required',
      );
    });
  });

  describe('log', () => {
    it('should send log entry to Logtail client', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test log message',
        metadata: {
          action: 'test',
          userId: '123',
        },
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockLogtailClient.info).toHaveBeenCalledWith(
        'Test log message',
        expect.objectContaining({
          action: 'test',
          level: 'info',
          userId: '123',
        }),
      );
    });

    it('should map log levels correctly', async () => {
      const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];

      for (const level of levels) {
        vi.clearAllMocks();

        await provider.log(level, `Test ${level}`, { timestamp: new Date().toISOString() });

        // Check that the correct method was called
        switch (level) {
          case 'debug':
            expect(mockLogtailClient.debug).toHaveBeenCalled();
            break;
          case 'info':
            expect(mockLogtailClient.info).toHaveBeenCalled();
            break;
          case 'warn':
            expect(mockLogtailClient.warn).toHaveBeenCalled();
            break;
          case 'error':
            expect(mockLogtailClient.error).toHaveBeenCalled();
            break;
        }
      }
    });

    it('should send multiple logs', async () => {
      // Send multiple logs quickly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(provider.log('info', `Log ${i}`, { timestamp: new Date().toISOString() }));
      }

      await Promise.all(promises);

      // Each log should be sent individually to the Logtail client
      // The client handles batching internally
      expect(mockLogtailClient.info).toHaveBeenCalledTimes(5);
    });

    it('should handle client errors gracefully', async () => {
      // Mock the Logtail client to throw an error
      mockLogtailClient.error.mockRejectedValueOnce(new Error('Client error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await provider.log('error', 'Test error', { timestamp: new Date().toISOString() });

      // The provider should handle the error gracefully
      expect(mockLogtailClient.error).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    // Removed duplicate error handling test

    it('should not send logs when not initialized', async () => {
      const disabledProvider = new LogtailProvider();
      // Don't initialize it, so it remains disabled

      await disabledProvider.log('info', 'Should not be sent', {
        timestamp: new Date().toISOString(),
      });

      // None of the Logtail client methods should be called
      expect(mockLogtailClient.info).not.toHaveBeenCalled();
      expect(mockLogtailClient.debug).not.toHaveBeenCalled();
      expect(mockLogtailClient.warn).not.toHaveBeenCalled();
      expect(mockLogtailClient.error).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    it('should log error as error level', async () => {
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:123';

      await provider.captureException(error, { userId: '123' });

      expect(mockLogtailClient.error).toHaveBeenCalledWith(
        'Exception captured',
        expect.objectContaining({
          error: {
            name: 'Error',
            message: 'Test exception',
            stack: error.stack,
          },
          level: 'error',
          userId: '123',
        }),
      );
    });

    it('should handle non-Error objects', async () => {
      const error = { code: 500, message: 'Custom error' };

      await provider.captureException(error as any);

      expect(mockLogtailClient.error).toHaveBeenCalledWith(
        'Exception captured',
        expect.any(Object),
      );
    });

    it('should handle string errors', async () => {
      await provider.captureException('String error' as any);

      expect(mockLogtailClient.error).toHaveBeenCalledWith(
        'Exception captured',
        expect.any(Object),
      );
    });
  });

  describe('setUser', () => {
    it('should set user context via middleware', () => {
      provider.setUser({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      });

      // The use method should be called to add user context
      expect(mockLogtailClient.use).toHaveBeenCalled();
    });
  });

  describe('setTag', () => {
    it('should set tag via middleware', () => {
      provider.setTag('environment', 'production');

      // The use method should be called to add tag
      expect(mockLogtailClient.use).toHaveBeenCalled();
    });
  });

  describe('setExtra', () => {
    it('should set extra data via middleware', () => {
      provider.setExtra('version', '1.0.0');

      // The use method should be called to add extra data
      expect(mockLogtailClient.use).toHaveBeenCalled();
    });
  });

  describe('setContext', () => {
    it('should add context via middleware', () => {
      // setContext takes key and value as separate arguments
      provider.setContext('app', {
        environment: 'production',
        version: '1.0.0',
      });

      // The use method should be called to add middleware
      expect(mockLogtailClient.use).toHaveBeenCalled();
    });
  });

  describe('startTransaction', () => {
    it('should log transaction start and provide finish method', () => {
      const transaction = provider.startTransaction('test-transaction', {
        userId: '123',
      });

      expect(mockLogtailClient.info).toHaveBeenCalledWith(
        'Transaction started: test-transaction',
        expect.objectContaining({
          transactionName: 'test-transaction',
          userId: '123',
        }),
      );

      // Clear previous calls
      mockLogtailClient.info.mockClear();

      // Finish the transaction
      transaction.finish();

      expect(mockLogtailClient.info).toHaveBeenCalledWith(
        'Transaction completed: test-transaction',
        expect.objectContaining({
          durationUnit: 'ms',
          transactionName: 'test-transaction',
        }),
      );
    });
  });

  describe('addBreadcrumb', () => {
    it('should log breadcrumb as debug entry', () => {
      provider.addBreadcrumb({
        type: 'navigation',
        category: 'route',
        data: { from: '/home', to: '/dashboard' },
        level: 'info',
        message: 'Navigated to /dashboard',
      });

      expect(mockLogtailClient.debug).toHaveBeenCalledWith(
        'Breadcrumb',
        expect.objectContaining({
          breadcrumb: expect.objectContaining({
            type: 'navigation',
            category: 'route',
            message: 'Navigated to /dashboard',
          }),
        }),
      );
    });
  });

  describe('batching', () => {
    it('should send logs to Logtail client', async () => {
      // Send logs without awaiting
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(provider.log('info', `Log ${i}`, { timestamp: new Date().toISOString() }));
      }

      await Promise.all(promises);

      // Logtail client handles batching internally
      expect(mockLogtailClient.info).toHaveBeenCalledTimes(3);
    });

    it('should handle many logs', async () => {
      // Send many logs
      const promises = [];
      for (let i = 0; i < 101; i++) {
        promises.push(provider.log('info', `Log ${i}`, { timestamp: new Date().toISOString() }));
      }

      await Promise.all(promises);

      // All logs should be sent
      expect(mockLogtailClient.info).toHaveBeenCalledTimes(101);
    });
  });
});
