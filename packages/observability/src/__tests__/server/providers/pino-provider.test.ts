import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PinoProvider } from '../../../server/providers/pino-provider';

import type { LogEntry } from '../../../shared/types/logger-types';

// Mock pino
const mockPino = {
  child: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  flush: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
};

const mockPinoConstructor = vi.fn(() => mockPino);

vi.mock('pino', () => mockPinoConstructor);

describe('PinoProvider', () => {
  let provider: PinoProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPino.child.mockReturnValue(mockPino);
    mockPino.flush.mockImplementation((cb) => cb && cb());

    provider = new PinoProvider({
      level: 'info',
      transport: {
        target: 'pino-pretty',
      },
    });
  });

  describe('constructor', () => {
    it('should initialize pino with provided options', () => {
      expect(mockPinoConstructor).toHaveBeenCalledWith({
        level: 'info',
        transport: {
          target: 'pino-pretty',
        },
      });
    });

    it('should use default options when none provided', () => {
      mockPinoConstructor.mockClear();
      new PinoProvider();

      expect(mockPinoConstructor).toHaveBeenCalledWith({
        level: 'info',
      });
    });

    it('should always be enabled', () => {
      expect(provider.isEnabled()).toBe(true);
    });
  });

  describe('log', () => {
    it('should log debug messages', async () => {
      const entry: LogEntry = {
        level: 'debug',
        message: 'Debug message',
        metadata: { userId: '123' },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.debug).toHaveBeenCalledWith({ userId: '123' }, 'Debug message');
    });

    it('should log info messages', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Info message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.info).toHaveBeenCalledWith({}, 'Info message');
    });

    it('should log warn messages', async () => {
      const entry: LogEntry = {
        level: 'warn',
        message: 'Warning message',
        metadata: { code: 'WARN001' },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.warn).toHaveBeenCalledWith({ code: 'WARN001' }, 'Warning message');
    });

    it('should log error messages', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Error message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.error).toHaveBeenCalledWith({}, 'Error message');
    });

    it('should handle entries without metadata', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Simple message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.info).toHaveBeenCalledWith({}, 'Simple message');
    });
  });

  describe('captureException', () => {
    it('should log error with stack trace', async () => {
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:123';

      await provider.captureException(error, { requestId: 'req-123' });

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          err: error,
          requestId: 'req-123',
        },
        'Test exception',
      );
    });

    it('should handle errors without context', async () => {
      const error = new Error('Simple error');

      await provider.captureException(error);

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          err: error,
        },
        'Simple error',
      );
    });

    it('should handle non-Error objects', async () => {
      const error = { code: 500, message: 'Custom error' };

      await provider.captureException(error as any, { endpoint: '/api/test' });

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          endpoint: '/api/test',
          err: error,
        },
        'Custom error',
      );
    });

    it('should handle string errors', async () => {
      await provider.captureException('String error' as any);

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          err: 'String error',
        },
        'String error',
      );
    });
  });

  describe('identify', () => {
    it('should create child logger with user context', async () => {
      await provider.identify('user-123', {
        name: 'Test User',
        email: 'test@example.com',
      });

      expect(mockPino.child).toHaveBeenCalledWith({
        user: {
          name: 'Test User',
          email: 'test@example.com',
        },
        userId: 'user-123',
      });
    });

    it('should handle identification without traits', async () => {
      await provider.identify('user-456');

      expect(mockPino.child).toHaveBeenCalledWith({
        userId: 'user-456',
      });
    });

    it('should log subsequent messages with user context', async () => {
      const childLogger = {
        ...mockPino,
        info: vi.fn(),
      };
      mockPino.child.mockReturnValue(childLogger);

      await provider.identify('user-789');
      await provider.log({
        level: 'info',
        message: 'User action',
        timestamp: new Date().toISOString(),
      });

      expect(childLogger.info).toHaveBeenCalledWith({}, 'User action');
    });
  });

  describe('setContext', () => {
    it('should create child logger with context', async () => {
      await provider.setContext({
        environment: 'production',
        region: 'us-east-1',
        version: '1.0.0',
      });

      expect(mockPino.child).toHaveBeenCalledWith({
        environment: 'production',
        region: 'us-east-1',
        version: '1.0.0',
      });
    });

    it('should merge multiple context calls', async () => {
      await provider.setContext({ env: 'prod' });
      await provider.setContext({ version: '1.0' });

      expect(mockPino.child).toHaveBeenCalledTimes(2);
    });
  });

  describe('flush', () => {
    it('should flush pino logger', async () => {
      await provider.flush();

      expect(mockPino.flush).toHaveBeenCalled();
    });

    it('should handle flush timeout', async () => {
      mockPino.flush.mockImplementation(() => {
        // Don't call callback to simulate timeout
      });

      const start = Date.now();
      await provider.flush(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThan(150);
    });

    it('should handle flush errors', async () => {
      mockPino.flush.mockImplementation((cb) => {
        cb(new Error('Flush failed'));
      });

      // Should not throw
      await expect(provider.flush()).resolves.toBeUndefined();
    });
  });

  describe('configuration', () => {
    it('should support custom transports', () => {
      mockPinoConstructor.mockClear();

      new PinoProvider({
        transport: {
          targets: [
            { level: 'info', target: 'pino-pretty' },
            { options: { destination: './app.log' }, target: 'pino/file' },
          ],
        },
      });

      expect(mockPinoConstructor).toHaveBeenCalledWith({
        level: 'info',
        transport: {
          targets: [
            { level: 'info', target: 'pino-pretty' },
            { options: { destination: './app.log' }, target: 'pino/file' },
          ],
        },
      });
    });

    it('should support custom serializers', () => {
      mockPinoConstructor.mockClear();

      new PinoProvider({
        serializers: {
          req: (req: any) => ({ url: req.url }),
          res: (res: any) => ({ statusCode: res.statusCode }),
        },
      });

      expect(mockPinoConstructor).toHaveBeenCalledWith({
        level: 'info',
        serializers: expect.any(Object),
      });
    });

    it('should support custom formatters', () => {
      mockPinoConstructor.mockClear();

      new PinoProvider({
        formatters: {
          level: (label: string) => ({ level: label }),
        },
      });

      expect(mockPinoConstructor).toHaveBeenCalledWith({
        formatters: expect.any(Object),
        level: 'info',
      });
    });
  });
});
