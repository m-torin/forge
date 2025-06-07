import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LogtailProvider } from '../../../shared/providers/logtail-provider';

import type { LogEntry } from '../../../shared/types/logger-types';

// Mock fetch
global.fetch = vi.fn();

describe('LogtailProvider', () => {
  let provider: LogtailProvider;
  const mockToken = 'test-logtail-token';
  const mockFetch = global.fetch as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: async () => ({ success: true }),
      ok: true,
    });

    provider = new LogtailProvider(mockToken);
  });

  describe('constructor', () => {
    it('should initialize with provided token', () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it('should be disabled without token', () => {
      const disabledProvider = new LogtailProvider('');
      expect(disabledProvider.isEnabled()).toBe(false);
    });
  });

  describe('log', () => {
    it('should send log entry to Logtail API', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test log message',
        metadata: {
          action: 'test',
          userId: '123',
        },
        timestamp: '2023-01-01T00:00:00.000Z',
      };

      await provider.log(entry);

      expect(mockFetch).toHaveBeenCalledWith('https://in.logs.betterstack.com', {
        body: JSON.stringify({
          dt: '2023-01-01T00:00:00.000Z',
          level: 'info',
          message: 'Test log message',
          metadata: {
            action: 'test',
            userId: '123',
          },
        }),
        headers: {
          Authorization: 'Bearer test-logtail-token',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
    });

    it('should map log levels correctly', async () => {
      const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];

      for (const level of levels) {
        mockFetch.mockClear();

        await provider.log({
          level,
          message: `Test ${level}`,
          timestamp: new Date().toISOString(),
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.level).toBe(level);
      }
    });

    it('should batch multiple logs', async () => {
      // Send multiple logs quickly
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          provider.log({
            level: 'info',
            message: `Log ${i}`,
            timestamp: new Date().toISOString(),
          }),
        );
      }

      await Promise.all(promises);

      // Should batch logs
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(5);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await provider.log({
        level: 'error',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send logs to Logtail:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await provider.log({
        level: 'error',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send logs to Logtail:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should not send logs when disabled', async () => {
      const disabledProvider = new LogtailProvider('');

      await disabledProvider.log({
        level: 'info',
        message: 'Should not be sent',
        timestamp: new Date().toISOString(),
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    it('should log error as error level', async () => {
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:123';

      await provider.captureException(error, { userId: '123' });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.level).toBe('error');
      expect(body.message).toBe('Test exception');
      expect(body.error).toEqual({
        name: 'Error',
        message: 'Test exception',
        stack: error.stack,
      });
      expect(body.context).toEqual({ userId: '123' });
    });

    it('should handle non-Error objects', async () => {
      const error = { code: 500, message: 'Custom error' };

      await provider.captureException(error as any);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.error).toEqual(error);
    });

    it('should handle string errors', async () => {
      await provider.captureException('String error' as any);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.message).toBe('String error');
      expect(body.error).toBe('String error');
    });
  });

  describe('identify', () => {
    it('should send user identification event', async () => {
      await provider.identify('user-123', {
        name: 'Test User',
        email: 'test@example.com',
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.event).toBe('identify');
      expect(body.userId).toBe('user-123');
      expect(body.traits).toEqual({
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should handle identification without traits', async () => {
      await provider.identify('user-456');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.userId).toBe('user-456');
      expect(body.traits).toBeUndefined();
    });
  });

  describe('setContext', () => {
    it('should store context for future logs', async () => {
      await provider.setContext({
        environment: 'production',
        version: '1.0.0',
      });

      await provider.log({
        level: 'info',
        message: 'Test with context',
        timestamp: new Date().toISOString(),
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.context).toEqual({
        environment: 'production',
        version: '1.0.0',
      });
    });

    it('should merge context with log metadata', async () => {
      await provider.setContext({
        environment: 'production',
      });

      await provider.log({
        level: 'info',
        message: 'Test',
        metadata: {
          userId: '123',
        },
        timestamp: new Date().toISOString(),
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.context).toEqual({
        environment: 'production',
      });
      expect(body.metadata).toEqual({
        userId: '123',
      });
    });
  });

  describe('flush', () => {
    it('should send any pending logs immediately', async () => {
      // Add a log but don't wait
      provider.log({
        level: 'info',
        message: 'Pending log',
        timestamp: new Date().toISOString(),
      });

      // Flush should send immediately
      await provider.flush();

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should wait for timeout duration', async () => {
      const start = Date.now();
      await provider.flush(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90); // Allow some margin
      expect(duration).toBeLessThan(150);
    });
  });

  describe('batching', () => {
    it('should batch logs within time window', async () => {
      // Send logs without awaiting
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          provider.log({
            level: 'info',
            message: `Log ${i}`,
            timestamp: new Date().toISOString(),
          }),
        );
      }

      await Promise.all(promises);

      // Should send as batch
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(3);
    });

    it('should send large batches immediately', async () => {
      // Send many logs to trigger batch size limit
      const promises = [];
      for (let i = 0; i < 101; i++) {
        promises.push(
          provider.log({
            level: 'info',
            message: `Log ${i}`,
            timestamp: new Date().toISOString(),
          }),
        );
      }

      await Promise.all(promises);

      // Should send multiple batches
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
