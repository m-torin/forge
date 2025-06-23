/**
 * Sentry client provider tests
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SentryClientProvider } from '../../../client/providers/sentry-client';
import { SentryConfig } from '../../../shared/types/sentry-types';
import { Breadcrumb, ObservabilityContext } from '../../../shared/types/types';

// Mock Sentry
const mockSentry = {
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  endSession: vi.fn(),
  getCurrentScope: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({ name: 'Replay' }),
  setContext: vi.fn(),
  setExtra: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  startSession: vi.fn(),
  startSpan: vi.fn(),
  startTransaction: vi.fn(),
  withScope: vi.fn(),
};

// Mock dynamic import - client provider imports from @sentry/nextjs
vi.mock('@sentry/nextjs', () => ({
  default: mockSentry,
  ...mockSentry,
}));

describe('sentryClientProvider', () => {
  let provider: SentryClientProvider;
  let config: SentryConfig;

  const originalConsole = console;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation();

    // Reset mockSentry.init to not throw by default
    mockSentry.init.mockImplementation(() => {});

    provider = new SentryClientProvider();
    config = {
      debug: false,
      dsn: 'https://test@sentry.io/123456',
      environment: 'test',
      profilesSampleRate: 0.1,
      release: '1.0.0',
      tracesSampleRate: 0.5,
    };

    // Setup Sentry mock scope
    const mockScope = {
      setExtra: vi.fn(),
      setFingerprint: vi.fn(),
      setLevel: vi.fn(),
      setSpan: vi.fn(),
      setTag: vi.fn(),
      setUser: vi.fn(),
    };

    mockSentry.withScope.mockImplementation((callback: any) => {
      callback(mockScope);
    });

    mockSentry.getCurrentScope.mockReturnValue(mockScope);

    // Setup transaction mock
    const mockTransaction = {
      finish: vi.fn(),
      setData: vi.fn(),
      setStatus: vi.fn(),
      setTag: vi.fn(),
      startChild: vi.fn().mockReturnValue({
        finish: vi.fn(),
        setData: vi.fn(),
      }),
    };

    mockSentry.startSpan.mockImplementation((options: any, callback?: any) => {
      if (callback) {
        // For transactions, call the callback with the mock transaction
        return callback(mockTransaction);
      } else {
        // For spans, return the span object directly
        return {
          id: 'mock-span-id',
          finish: vi.fn(),
          setData: vi.fn(),
          setStatus: vi.fn(),
          setTag: vi.fn(),
        };
      }
    });
  });

  afterEach(() => {
    console.error = originalConsole.error;
  });

  describe('initialization', () => {
    test('should initialize Sentry with correct configuration', async () => {
      await provider.initialize(config);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          beforeSend: undefined,
          beforeSendTransaction: undefined,
          dsn: 'https://test@sentry.io/123456',
          environment: 'test',
          integrations: [], // No integrations by default
          release: '1.0.0',
          replaysOnErrorSampleRate: 1,
          replaysSessionSampleRate: 0.1,
          tracesSampleRate: 0.5,
        }),
      );
    });

    test('should skip initialization without DSN', async () => {
      const configWithoutDsn = { ...config } as any;
      delete configWithoutDsn.dsn;

      // Should not throw, just skip initialization
      await provider.initialize(configWithoutDsn);

      // Sentry.init should not be called when no DSN is provided
      expect(mockSentry.init).not.toHaveBeenCalled();
    });

    test('should use default values for optional config', async () => {
      const minimalConfig = { dsn: 'https://test@sentry.io/123456' };

      await provider.initialize(minimalConfig);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123456',
          environment: 'test',
          tracesSampleRate: 1,
          replaysOnErrorSampleRate: 1,
          replaysSessionSampleRate: 0.1,
          integrations: [],
        }),
      );
    });

    test('should include custom integrations', async () => {
      const customIntegration = { name: 'CustomIntegration' };
      const configWithIntegrations = {
        ...config,
        integrations: [customIntegration],
      };

      await provider.initialize(configWithIntegrations);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          integrations: [customIntegration], // Only custom integration, no replay by default
        }),
      );
    });

    test('should include custom options', async () => {
      const configWithOptions = {
        ...config,
        options: {
          maxBreadcrumbs: 50,
          normalizeDepth: 5,
        },
      };

      await provider.initialize(configWithOptions);

      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          maxBreadcrumbs: 50,
          normalizeDepth: 5,
        }),
      );
    });

    test('should handle initialization errors', async () => {
      mockSentry.init.mockImplementation(() => {
        throw new Error('Sentry init failed');
      });

      await expect(provider.initialize(config)).rejects.toThrow('Sentry init failed');
      expect(console.error).toHaveBeenCalledWith('Failed to initialize Sentry:', expect.any(Error));
    });
  });

  describe('exception capture', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should capture exceptions with context', async () => {
      const error = new Error('Test error');
      const context: ObservabilityContext = {
        extra: { requestId: 'req-123' },
        fingerprint: ['custom', 'fingerprint'],
        level: 'error',
        requestId: 'request-123',
        sessionId: 'session-123',
        tags: { feature: 'test' },
        userId: 'user-123',
      };

      await provider.captureException(error, context);

      expect(mockSentry.withScope).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);

      // Verify scope was configured correctly
      const scopeCallback = mockSentry.withScope.mock.calls[0][0];
      const mockScope = {
        setExtra: vi.fn(),
        setFingerprint: vi.fn(),
        setLevel: vi.fn(),
        setTag: vi.fn(),
        setUser: vi.fn(),
      };

      scopeCallback(mockScope);

      expect(mockScope.setUser).toHaveBeenCalledWith({ id: 'user-123' });
      expect(mockScope.setTag).toHaveBeenCalledWith('feature', 'test');
      expect(mockScope.setTag).toHaveBeenCalledWith('session_id', 'session-123');
      expect(mockScope.setTag).toHaveBeenCalledWith('request_id', 'request-123');
      expect(mockScope.setExtra).toHaveBeenCalledWith('requestId', 'req-123');
      expect(mockScope.setLevel).toHaveBeenCalledWith('error');
      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['custom', 'fingerprint']);
    });

    test('should capture exceptions without context', async () => {
      const error = new Error('Simple error');

      await provider.captureException(error);

      expect(mockSentry.withScope).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSentry.captureException).toHaveBeenCalledWith(error);
    });

    test('should not capture when not initialized', async () => {
      const uninitializedProvider = new SentryClientProvider();
      const error = new Error('Test error');

      await uninitializedProvider.captureException(error);

      expect(mockSentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('message capture', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should capture messages with correct level mapping', async () => {
      const message = 'Test message';
      const context: ObservabilityContext = {
        tags: { component: 'test' },
      };

      await provider.captureMessage(message, 'warning', context);

      expect(mockSentry.withScope).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSentry.captureMessage).toHaveBeenCalledWith(message, 'warning');
    });

    test('should map info level correctly', async () => {
      await provider.captureMessage('Info message', 'info');

      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Info message', 'info');
    });

    test('should map error level correctly', async () => {
      await provider.captureMessage('Error message', 'error');

      expect(mockSentry.captureMessage).toHaveBeenCalledWith('Error message', 'error');
    });

    test('should not capture when not initialized', async () => {
      const uninitializedProvider = new SentryClientProvider();

      await uninitializedProvider.captureMessage('Test', 'info');

      expect(mockSentry.captureMessage).not.toHaveBeenCalled();
    });
  });

  describe('transactions and spans', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should start transactions with context', () => {
      const name = 'test-transaction';
      const context: ObservabilityContext = {
        extra: { data: 'test' },
        operation: 'custom-op',
        tags: { feature: 'test' },
        traceId: 'trace-123',
      };

      const transaction = provider.startTransaction(name, context);

      expect(mockSentry.startSpan).toHaveBeenCalledWith(
        {
          name,
          op: 'custom-op',
          attributes: {
            feature: 'test',
            data: 'test',
          },
        },
        expect.any(Function),
      );

      expect(transaction).toStrictEqual({
        finish: expect.any(Function),
        setData: expect.any(Function),
        setStatus: expect.any(Function),
        setTag: expect.any(Function),
        startChild: expect.any(Function),
      });
    });

    test('should start transactions with default operation', () => {
      const name = 'default-transaction';

      provider.startTransaction(name);

      expect(mockSentry.startSpan).toHaveBeenCalledWith(
        {
          name,
          op: 'navigation',
          attributes: {},
        },
        expect.any(Function),
      );
    });

    test('should start spans with parent', () => {
      const parentSpan = {
        startChild: vi.fn().mockReturnValue({ id: 'child-span' }),
      };

      const span = provider.startSpan('test-span', parentSpan);

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-span',
        op: 'test-span',
        parentSpan,
      });
      expect(span).toBeDefined();
    });

    test('should start transaction when no parent span', () => {
      const _span = provider.startSpan('test-span');

      expect(mockSentry.startSpan).toHaveBeenCalledWith({
        name: 'test-span',
        op: 'test-span',
      });
    });

    test('should return null for transactions when not initialized', () => {
      const uninitializedProvider = new SentryClientProvider();

      const transaction = uninitializedProvider.startTransaction('test');

      expect(transaction).toBeNull();
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should set user', () => {
      const user = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      };

      provider.setUser(user);

      expect(mockSentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
      });
    });

    test('should set tags', () => {
      provider.setTag('environment', 'test');

      expect(mockSentry.setTag).toHaveBeenCalledWith('environment', 'test');
    });

    test('should set extra data', () => {
      const extra = { metadata: { test: true }, requestId: 'req-123' };

      provider.setExtra('request', extra);

      expect(mockSentry.setExtra).toHaveBeenCalledWith('request', extra);
    });

    test('should set context', () => {
      const context = { features: ['a', 'b'], version: '1.0.0' };

      provider.setContext('app', context);

      expect(mockSentry.setContext).toHaveBeenCalledWith('app', context);
    });

    test('should not set context when not initialized', () => {
      const uninitializedProvider = new SentryClientProvider();

      uninitializedProvider.setUser({ id: 'test' });
      uninitializedProvider.setTag('test', 'value');
      uninitializedProvider.setExtra('test', 'value');
      uninitializedProvider.setContext('test', {});

      expect(mockSentry.setUser).not.toHaveBeenCalled();
      expect(mockSentry.setTag).not.toHaveBeenCalled();
      expect(mockSentry.setExtra).not.toHaveBeenCalled();
      expect(mockSentry.setContext).not.toHaveBeenCalled();
    });
  });

  describe('breadcrumbs', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should add breadcrumbs with full data', () => {
      const breadcrumb: Breadcrumb = {
        type: 'navigation',
        category: 'ui',
        data: { from: '/home', to: '/about' },
        level: 'info',
        message: 'User navigated',
        timestamp: 1234567890000, // milliseconds
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        type: 'navigation',
        category: 'ui',
        data: { from: '/home', to: '/about' },
        level: 'info',
        message: 'User navigated',
        timestamp: 1234567890, // converted to seconds
      });
    });

    test('should add breadcrumbs with default values', () => {
      const breadcrumb: Breadcrumb = {
        category: 'custom',
        message: 'Custom event',
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith({
        type: 'default',
        category: 'custom',
        data: undefined,
        level: 'info',
        message: 'Custom event',
        timestamp: undefined,
      });
    });

    test('should not add breadcrumbs when not initialized', () => {
      const uninitializedProvider = new SentryClientProvider();
      const breadcrumb: Breadcrumb = {
        category: 'test',
        message: 'Test breadcrumb',
      };

      uninitializedProvider.addBreadcrumb(breadcrumb);

      expect(mockSentry.addBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('session management', () => {
    beforeEach(async () => {
      await provider.initialize(config);
    });

    test('should start sessions', () => {
      provider.startSession();

      expect(mockSentry.startSession).toHaveBeenCalledWith();
    });

    test('should end sessions', () => {
      provider.endSession();

      expect(mockSentry.endSession).toHaveBeenCalledWith();
    });

    test('should not manage sessions when not initialized', () => {
      const uninitializedProvider = new SentryClientProvider();

      uninitializedProvider.startSession();
      uninitializedProvider.endSession();

      expect(mockSentry.startSession).not.toHaveBeenCalled();
      expect(mockSentry.endSession).not.toHaveBeenCalled();
    });
  });

  describe('provider metadata', () => {
    test('should have correct name', () => {
      expect(provider.name).toBe('sentry-client');
    });
  });
});
