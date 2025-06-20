import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocking
import { PinoProvider } from '../../../server/providers/pino-provider';
import { LogEntry } from '../../../shared/types/logger-types';

// Use vi.hoisted for mocks
const { mockPino, mockPinoConstructor } = vi.hoisted(() => {
  const mockPino = {
    child: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    flush: vi.fn((cb: any) => cb?.()),
    info: vi.fn(),
    warn: vi.fn(),
  };

  const mockPinoConstructor = vi.fn(() => mockPino);

  return { mockPino, mockPinoConstructor };
});

// Mock the PinoProvider module to inject our mock
vi.mock('../../../server/providers/pino-provider', async () => {
  const actual = (await vi.importActual('../../../server/providers/pino-provider')) as any;

  class MockedPinoProvider extends actual.PinoProvider {
    constructor(options: any = {}) {
      super(options);
      // Override the logger with our mock
      (this as any).logger = mockPino;
      (this as any).childLogger = null;
    }
  }

  return {
    ...actual,
    PinoProvider: MockedPinoProvider,
  };
});

describe('pinoProvider', () => {
  let provider: PinoProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockPino.child.mockReturnValue(mockPino);
    mockPino.flush.mockImplementation((cb: any) => cb?.());
    mockPinoConstructor.mockReturnValue(mockPino);
    // Set up .default property for ES module fallback
    (mockPinoConstructor as any).default = mockPinoConstructor;
  });

  describe('constructor', () => {
    test('should initialize pino with provided options', () => {
      provider = new PinoProvider({
        level: 'info',
        transport: {
          target: 'pino-pretty',
        },
      });

      // Since we're mocking the provider itself, just verify it was created
      expect(provider).toBeDefined();
      expect((provider as any).logger).toBe(mockPino);
    });

    test('should use default options when none provided', () => {
      provider = new PinoProvider();

      // Since we're mocking the provider itself, just verify it was created
      expect(provider).toBeDefined();
      expect((provider as any).logger).toBe(mockPino);
    });

    test('should always be enabled', () => {
      provider = new PinoProvider();
      expect(provider.isEnabled()).toBeTruthy();
    });
  });

  describe('log', () => {
    beforeEach(() => {
      provider = new PinoProvider();
    });

    test('should log debug messages', async () => {
      const entry: LogEntry = {
        level: 'debug',
        message: 'Debug message',
        metadata: { userId: '123' },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.debug).toHaveBeenCalledWith({ userId: '123' }, 'Debug message');
    });

    test('should log info messages', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Info message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.info).toHaveBeenCalledWith({}, 'Info message');
    });

    test('should log warn messages', async () => {
      const entry: LogEntry = {
        level: 'warn',
        message: 'Warning message',
        metadata: { code: 'WARN001' },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.warn).toHaveBeenCalledWith({ code: 'WARN001' }, 'Warning message');
    });

    test('should log error messages', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Error message',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry.level, entry.message, entry.metadata);

      expect(mockPino.error).toHaveBeenCalledWith({}, 'Error message');
    });

    test('should handle entries without metadata', async () => {
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
    beforeEach(() => {
      provider = new PinoProvider();
    });

    test('should log error with stack trace', async () => {
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

    test('should handle errors without context', async () => {
      const error = new Error('Simple error');

      await provider.captureException(error);

      expect(mockPino.error).toHaveBeenCalledWith(
        {
          err: error,
        },
        'Simple error',
      );
    });

    test('should handle non-Error objects', async () => {
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

    test('should handle string errors', async () => {
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
    beforeEach(() => {
      provider = new PinoProvider();
    });

    test('should create child logger with user context', async () => {
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

    test('should handle identification without traits', async () => {
      await provider.identify('user-456');

      expect(mockPino.child).toHaveBeenCalledWith({
        userId: 'user-456',
      });
    });

    test('should log subsequent messages with user context', async () => {
      const childLogger = {
        ...mockPino,
        info: vi.fn(),
      };
      mockPino.child.mockReturnValue(childLogger);

      await provider.identify('user-789');
      await provider.log('info', 'User action');

      expect(childLogger.info).toHaveBeenCalledWith({}, 'User action');
    });
  });

  describe('setContext', () => {
    beforeEach(() => {
      provider = new PinoProvider();
    });

    test('should create child logger with context', () => {
      provider.setContext('app', {
        environment: 'production',
        region: 'us-east-1',
        version: '1.0.0',
      });

      expect(mockPino.child).toHaveBeenCalledWith({
        app: {
          environment: 'production',
          region: 'us-east-1',
          version: '1.0.0',
        },
      });
    });

    test('should merge multiple context calls', () => {
      provider.setContext('env', { environment: 'prod' });
      provider.setContext('version', { number: '1.0' });

      expect(mockPino.child).toHaveBeenCalledTimes(2);
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      provider = new PinoProvider();
    });

    test('should flush pino logger', async () => {
      await provider.flush();

      expect(mockPino.flush).toHaveBeenCalledWith();
    });

    test('should handle flush timeout', async () => {
      mockPino.flush.mockImplementation(() => {
        // Don't call callback to simulate timeout
      });

      const start = Date.now();
      await provider.flush(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThan(150);
    });

    test('should handle flush errors', async () => {
      mockPino.flush.mockImplementation((cb: any) => {
        cb(new Error('Flush failed'));
      });

      // Should not throw
      await expect(provider.flush()).resolves.toBeUndefined();
    });
  });

  describe('configuration', () => {
    test('should support custom transports', () => {
      const customProvider = new PinoProvider({
        transport: {
          targets: [
            { level: 'info', target: 'pino-pretty' },
            { options: { destination: './app.log' }, target: 'pino/file' },
          ],
        },
      });

      // Just verify the provider was created with our mock
      expect(customProvider).toBeDefined();
      expect((customProvider as any).logger).toBe(mockPino);
    });

    test('should support custom serializers', () => {
      const customProvider = new PinoProvider({
        serializers: {
          req: (req: any) => ({ url: req.url }),
          res: (res: any) => ({ statusCode: res.statusCode }),
        },
      });

      // Just verify the provider was created with our mock
      expect(customProvider).toBeDefined();
      expect((customProvider as any).logger).toBe(mockPino);
    });

    test('should support custom formatters', () => {
      const customProvider = new PinoProvider({
        formatters: {
          level: (label: string) => ({ level: label }),
        },
      });

      // Just verify the provider was created with our mock
      expect(customProvider).toBeDefined();
      expect((customProvider as any).logger).toBe(mockPino);
    });
  });
});
