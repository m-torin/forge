import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SentryClientProvider } from '../../../src/client/providers/sentry-client';
import { SentryConfig } from '../../../src/shared/types/sentry-types';
import { Breadcrumb, ObservabilityContext } from '../../../src/shared/types/types';

// Mock the Environment utility
vi.mock('../../../src/shared/utils/environment', () => ({
  Environment: {
    isDevelopment: vi.fn().mockReturnValue(true),
  },
}));

describe('SentryClientProvider', () => {
  let provider: SentryClientProvider;
  let mockSentry: any;
  let mockScope: any;
  let mockSpan: any;

  beforeEach(() => {
    provider = new SentryClientProvider();
    
    // Create mock scope
    mockScope = {
      setUser: vi.fn(),
      setTag: vi.fn(),
      setExtra: vi.fn(),
      setLevel: vi.fn(),
      setFingerprint: vi.fn(),
    };

    // Create mock span
    mockSpan = {
      end: vi.fn(),
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
    };

    // Create mock Sentry instance
    mockSentry = {
      addBreadcrumb: vi.fn(),
      captureException: vi.fn(),
      captureMessage: vi.fn(),
      endSession: vi.fn(),
      setContext: vi.fn(),
      setExtra: vi.fn(),
      setTag: vi.fn(),
      setUser: vi.fn(),
      startSession: vi.fn(),
      startSpan: vi.fn().mockReturnValue(mockSpan),
      withScope: vi.fn((callback) => callback(mockScope)),
    };

    // Reset global object
    // @ts-ignore
    globalThis.Sentry = undefined;
    // @ts-ignore
    globalThis.window = undefined;
    
    vi.clearAllMocks();
  });

  describe('basic properties', () => {
    test('should have correct name', () => {
      expect(provider.name).toBe('sentry-client');
    });
  });

  describe('initialize', () => {
    test('should initialize successfully with valid config and global Sentry', async () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      };

      // @ts-ignore
      globalThis.Sentry = mockSentry;

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(true);
      expect(provider['client']).toBe(mockSentry);
    });

    test('should initialize successfully with window.Sentry', async () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      };

      // @ts-ignore
      globalThis.window = { Sentry: mockSentry };

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(true);
      expect(provider['client']).toBe(mockSentry);
    });

    test('should skip initialization silently when no DSN provided', async () => {
      const config: SentryConfig = {
        dsn: '',
        environment: 'test',
      };

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(false);
      expect(provider['client']).toBeUndefined();
    });

    test('should skip initialization when no global Sentry instance found', async () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      };

      // No global Sentry instance and empty window object
      // @ts-ignore
      globalThis.window = {};
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Import and mock Environment to ensure it's called
      const { Environment } = await import('../../../src/shared/utils/environment');
      vi.mocked(Environment.isDevelopment).mockReturnValue(true);

      await provider.initialize(config);

      expect(provider['isInitialized']).toBe(false);
      expect(provider['client']).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Sentry] Global Sentry instance not found. Please initialize Sentry via instrumentation-client.ts'
      );

      consoleSpy.mockRestore();
    });

    test('should throw error when initialization fails', async () => {
      const config: SentryConfig = {
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
      };

      // Mock window to throw an error when accessed
      Object.defineProperty(globalThis, 'window', {
        get() {
          throw new Error('Mock initialization error');
        },
        configurable: true,
      });

      await expect(provider.initialize(config)).rejects.toThrow('Failed to initialize Sentry: Error: Mock initialization error');

      // Restore
      delete (globalThis as any).window;
    });
  });

  describe('addBreadcrumb', () => {
    test('should add breadcrumb when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const breadcrumb: Breadcrumb = {
        category: 'navigation',
        message: 'User navigated to home page',
        level: 'info',
        timestamp: 1234567890000,
        type: 'navigation',
        data: { page: 'home' },
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'User navigated to home page',
        level: 'info',
        timestamp: 1234567890,
        type: 'navigation',
        data: { page: 'home' },
      });
    });

    test('should add breadcrumb with default values', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const breadcrumb: Breadcrumb = {
        category: 'navigation',
        message: 'User action',
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'User action',
        level: 'info',
        timestamp: undefined,
        type: 'default',
        data: undefined,
      });
    });

    test('should not add breadcrumb when not initialized', () => {
      provider['isInitialized'] = false;

      const breadcrumb: Breadcrumb = {
        category: 'navigation',
        message: 'User action',
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    test('should not add breadcrumb when client is null', () => {
      provider['isInitialized'] = true;
      provider['client'] = null;

      const breadcrumb: Breadcrumb = {
        category: 'navigation',
        message: 'User action',
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    test('should capture exception with context', async () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const error = new Error('Test error');
      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'auth' },
        extra: { request: 'POST /api/login' },
        level: 'error',
        fingerprint: ['auth', 'login'],
        sessionId: 'session123',
        requestId: 'req123',
      };

      await provider.captureException(error, context);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockScope.setUser).toHaveBeenCalledWith({ id: 'user123' });
      expect(mockScope.setTag).toHaveBeenCalledWith('component', 'auth');
      expect(mockScope.setExtra).toHaveBeenCalledWith('request', 'POST /api/login');
      expect(mockScope.setLevel).toHaveBeenCalledWith('error');
      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['auth', 'login']);
      expect(mockScope.setTag).toHaveBeenCalledWith('session_id', 'session123');
      expect(mockScope.setTag).toHaveBeenCalledWith('request_id', 'req123');
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    test('should capture exception without context', async () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const error = new Error('Test error');

      await provider.captureException(error);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    test('should not capture exception when not initialized', async () => {
      provider['isInitialized'] = false;

      const error = new Error('Test error');

      await provider.captureException(error);

      expect(mockSentry.withScope).not.toHaveBeenCalled();
    });

    test('should not capture exception when client is null', async () => {
      provider['isInitialized'] = true;
      provider['client'] = null;

      const error = new Error('Test error');

      await provider.captureException(error);

      expect(mockSentry.withScope).not.toHaveBeenCalled();
    });
  });

  describe('captureMessage', () => {
    test('should capture message with info level', async () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const context: ObservabilityContext = {
        userId: 'user123',
        tags: { component: 'auth' },
        extra: { request: 'POST /api/login' },
        fingerprint: ['auth', 'login'],
      };

      await provider.captureMessage('Test message', 'info', context);

      expect(mockSentry.withScope).toHaveBeenCalled();
      expect(mockScope.setUser).toHaveBeenCalledWith({ id: 'user123' });
      expect(mockScope.setTag).toHaveBeenCalledWith('component', 'auth');
      expect(mockScope.setExtra).toHaveBeenCalledWith('request', 'POST /api/login');
      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['auth', 'login']);
      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
    });

    test('should capture message with warning level', async () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      await provider.captureMessage('Test warning', 'warning');

      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test warning', 'warning');
    });

    test('should capture message with error level', async () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      await provider.captureMessage('Test error', 'error');

      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Test error', 'error');
    });

    test('should not capture message when not initialized', async () => {
      provider['isInitialized'] = false;

      await provider.captureMessage('Test message', 'info');

      expect(mockSentry.captureMessage).not.toHaveBeenCalled();
    });

    test('should not capture message when client is null', async () => {
      provider['isInitialized'] = true;
      provider['client'] = null;

      await provider.captureMessage('Test message', 'info');

      expect(mockSentry.captureMessage).not.toHaveBeenCalled();
    });
  });

  describe('session management', () => {
    test('should start session when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      provider.startSession();

      expect(mockSentry.startSession).toHaveBeenCalled();
    });

    test('should not start session when not initialized', () => {
      provider['isInitialized'] = false;

      provider.startSession();

      expect(mockSentry.startSession).not.toHaveBeenCalled();
    });

    test('should end session when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      provider.endSession();

      expect(mockSentry.endSession).toHaveBeenCalled();
    });

    test('should not end session when not initialized', () => {
      provider['isInitialized'] = false;

      provider.endSession();

      expect(mockSentry.endSession).not.toHaveBeenCalled();
    });
  });

  describe('context management', () => {
    test('should set context when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const context = { page: 'home', user: 'test' };

      provider.setContext('custom', context);

      expect(mockSentry.setContext).toHaveBeenCalledWith('custom', context);
    });

    test('should not set context when not initialized', () => {
      provider['isInitialized'] = false;

      provider.setContext('custom', { page: 'home' });

      expect(mockSentry.setContext).not.toHaveBeenCalled();
    });

    test('should set extra when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      provider.setExtra('customData', 'value');

      expect(mockSentry.setExtra).toHaveBeenCalledWith('customData', 'value');
    });

    test('should not set extra when not initialized', () => {
      provider['isInitialized'] = false;

      provider.setExtra('customData', 'value');

      expect(mockSentry.setExtra).not.toHaveBeenCalled();
    });

    test('should set tag when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      provider.setTag('environment', 'test');

      expect(mockSentry.setTag).toHaveBeenCalledWith('environment', 'test');
    });

    test('should not set tag when not initialized', () => {
      provider['isInitialized'] = false;

      provider.setTag('environment', 'test');

      expect(mockSentry.setTag).not.toHaveBeenCalled();
    });
  });

  describe('user management', () => {
    test('should set user with all properties when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        customProp: 'value',
      };

      provider.setUser(user);

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        customProp: 'value',
      });
    });

    test('should set user with minimal properties when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const user = {
        id: 'user123',
      };

      provider.setUser(user);

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user123',
        email: undefined,
        username: undefined,
      });
    });

    test('should not set user when not initialized', () => {
      provider['isInitialized'] = false;

      provider.setUser({ id: 'user123' });

      expect(mockSentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('tracing', () => {
    test('should start span when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const parentSpan = { id: 'parent123' };
      const span = provider.startSpan('test-operation', parentSpan);

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-operation',
        op: 'test-operation',
        parentSpan,
      });
      expect(span).toBe(mockSpan);
    });

    test('should start span without parent when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const span = provider.startSpan('test-operation');

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-operation',
        op: 'test-operation',
      });
      expect(span).toBe(mockSpan);
    });

    test('should not start span when not initialized', () => {
      provider['isInitialized'] = false;

      const span = provider.startSpan('test-operation');

      expect(mockSentry.startSpan).not.toHaveBeenCalled();
      expect(span).toBeNull();
    });

    test('should start transaction when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      const context: ObservabilityContext = {
        operation: 'http.request',
        tags: { method: 'GET' },
        extra: { url: '/api/test' },
      };

      mockSentry.startSpan.mockImplementation((config, callback) => {
        return callback(mockSpan);
      });

      const transaction = provider.startTransaction('test-transaction', context);

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-transaction',
        op: 'http.request',
        attributes: {
          method: 'GET',
          url: '/api/test',
        },
      }, expect.any(Function));

      expect(transaction).toBeDefined();
      expect(typeof transaction.finish).toBe('function');
      expect(typeof transaction.setData).toBe('function');
      expect(typeof transaction.setStatus).toBe('function');
      expect(typeof transaction.setTag).toBe('function');
      expect(typeof transaction.startChild).toBe('function');
    });

    test('should start transaction with default operation when initialized', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      mockSentry.startSpan.mockImplementation((config, callback) => {
        return callback(mockSpan);
      });

      const transaction = provider.startTransaction('test-transaction');

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-transaction',
        op: 'navigation',
        attributes: {},
      }, expect.any(Function));

      expect(transaction).toBeDefined();
    });

    test('should not start transaction when not initialized', () => {
      provider['isInitialized'] = false;

      const transaction = provider.startTransaction('test-transaction');

      expect(mockSentry.startSpan).not.toHaveBeenCalled();
      expect(transaction).toBeNull();
    });

    test('should test transaction wrapper methods', () => {
      provider['isInitialized'] = true;
      provider['client'] = mockSentry;

      // Mock startSpan to handle both callback and direct call cases
      mockSentry.startSpan.mockImplementation((config, callback) => {
        if (callback) {
          return callback(mockSpan);
        }
        return mockSpan;
      });

      const transaction = provider.startTransaction('test-transaction');

      // Test finish method
      transaction.finish();
      expect(mockSpan.end).toHaveBeenCalled();

      // Test setData method
      transaction.setData('key', 'value');
      expect(mockSpan.setAttribute).toHaveBeenCalledWith('key', 'value');

      // Test setStatus method
      transaction.setStatus('ok');
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 0 });

      transaction.setStatus('error');
      expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: 2 });

      // Test setTag method
      transaction.setTag('tag', 'value');
      expect(mockSpan.setAttribute).toHaveBeenCalledWith('tag', 'value');

      // Test startChild method
      const childSpan = transaction.startChild('child-op', 'child-description');
      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'child-description',
        op: 'child-op',
        parentSpan: mockSpan,
      });
    });
  });
});