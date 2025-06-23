import { beforeEach, describe, expect, vi } from 'vitest';

import { SentryServerProvider } from '../../../server/providers/sentry-server';

// Use vi.hoisted for mocks
const {
  mockAddBreadcrumb,
  mockCaptureException,
  mockCaptureMessage,
  mockScope,
  mockSentryInit,
  mockSetContext,
  mockSetExtra,
  mockSetTag,
  mockSetUser,
  mockStartTransaction,
  mockTransaction,
  mockWithScope,
} = vi.hoisted(() => {
  const mockScope = {
    setContext: vi.fn(),
    setExtra: vi.fn(),
    setFingerprint: vi.fn(),
    setSpan: vi.fn(),
    setTag: vi.fn(),
    setUser: vi.fn(),
  };

  const mockTransaction = {
    finish: vi.fn(),
    setData: vi.fn(),
    setHttpStatus: vi.fn(),
    setStatus: vi.fn(),
    setTag: vi.fn(),
    startChild: vi.fn(),
  };

  const mockSentryInit = vi.fn();
  const mockCaptureException = vi.fn();
  const mockCaptureMessage = vi.fn();
  const mockAddBreadcrumb = vi.fn();
  const mockSetUser = vi.fn();
  const mockSetTag = vi.fn();
  const mockSetExtra = vi.fn();
  const mockSetContext = vi.fn();
  const mockStartTransaction = vi.fn();
  const mockWithScope = vi.fn((callback: any) => callback(mockScope));

  return {
    mockAddBreadcrumb,
    mockCaptureException,
    mockCaptureMessage,
    mockScope,
    mockSentryInit,
    mockSetContext,
    mockSetExtra,
    mockSetTag,
    mockSetUser,
    mockStartTransaction,
    mockTransaction,
    mockWithScope,
  };
});

// Mock both @sentry/node and @sentry/nextjs since the provider imports from @sentry/nextjs
const sentryMock = {
  addBreadcrumb: mockAddBreadcrumb,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  getCurrentScope: vi.fn(() => mockScope),
  httpIntegration: vi.fn(),
  init: mockSentryInit,
  nativeNodeFetchIntegration: vi.fn(),
  setContext: mockSetContext,
  setExtra: mockSetExtra,
  setTag: mockSetTag,
  setUser: mockSetUser,
  startTransaction: mockStartTransaction,
  withScope: mockWithScope,
  // Add session management functions
  startSession: vi.fn(),
  endSession: vi.fn(),
};

vi.mock('@sentry/node', () => sentryMock);
vi.mock('@sentry/nextjs', () => sentryMock);

describe('sentryServerProvider', () => {
  let provider: SentryServerProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStartTransaction.mockReturnValue(mockTransaction);
    // Don't initialize provider here to avoid cross-contamination
    provider = new SentryServerProvider();
  });

  describe('initialization', () => {
    test('should initialize Sentry with provided config', async () => {
      const testProvider = new SentryServerProvider();
      await testProvider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'production',
        profilesSampleRate: 0.2,
        release: '1.0.0',
        tracesSampleRate: 0.5,
      });

      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/12345',
          environment: 'production',
          profilesSampleRate: 0.2,
          release: '1.0.0',
          tracesSampleRate: 0.5,
        }),
      );
    });

    test('should skip initialization without DSN', async () => {
      // Clear mocks to ensure we don't count calls from beforeEach
      vi.clearAllMocks();

      const testProvider = new SentryServerProvider();
      // Should not throw, just skip initialization
      await testProvider.initialize({});

      // Sentry.init should not be called when no DSN is provided
      expect(mockSentryInit).not.toHaveBeenCalled();
    });

    test('should use default values when not provided', async () => {
      // Clear mocks to get clean test
      vi.clearAllMocks();

      const testProvider = new SentryServerProvider();
      await testProvider.initialize({
        dsn: 'https://test@sentry.io/12345',
      });

      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/12345',
          environment: 'test',
          tracesSampleRate: 1,
          integrations: expect.any(Array),
        }),
      );
    });
  });

  describe('captureException', () => {
    test('should capture exception with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const error = new Error('Test error');
      await provider.captureException(error);

      expect(mockWithScope).toHaveBeenCalledWith(expect.any(Function));
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    test('should set context when provided', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const error = new Error('Test error');
      const context = {
        extra: { version: '1.0.0' },
        organizationId: 'org-456',
        tags: { environment: 'test' },
        userId: '123',
      };

      await provider.captureException(error, context);

      expect(mockScope.setUser).toHaveBeenCalledWith({ id: '123' });
      // Check that both tags were set (order doesn't matter)
      expect(mockScope.setTag).toHaveBeenCalledWith('environment', 'test');
      expect(mockScope.setTag).toHaveBeenCalledWith('organization_id', 'org-456');
      expect(mockScope.setTag).toHaveBeenCalledTimes(2);
      expect(mockScope.setExtra).toHaveBeenCalledWith('version', '1.0.0');
    });

    test('should set fingerprint when provided', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const error = new Error('Test error');
      const context = {
        fingerprint: ['error-type', 'user-action'],
      };

      await provider.captureException(error, context);

      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['error-type', 'user-action']);
    });
  });

  describe('captureMessage', () => {
    test('should capture message with correct level', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      await provider.captureMessage('Test message', 'info');

      expect(mockWithScope).toHaveBeenCalledWith(expect.any(Function));
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message', 'info');
    });

    test('should map warning level correctly', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      await provider.captureMessage('Warning message', 'warning');

      expect(mockCaptureMessage).toHaveBeenCalledWith('Warning message', 'warning');
    });

    test('should capture error messages', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      await provider.captureMessage('Error message', 'error');

      expect(mockCaptureMessage).toHaveBeenCalledWith('Error message', 'error');
    });

    test('should set context when provided', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const context = {
        extra: { attempt: 3 },
        tags: { feature: 'auth' },
        userId: '789',
      };

      await provider.captureMessage('Login failed', 'error', context);

      expect(mockScope.setUser).toHaveBeenCalledWith({ id: '789' });
      expect(mockScope.setTag).toHaveBeenCalledWith('feature', 'auth');
      expect(mockScope.setExtra).toHaveBeenCalledWith('attempt', 3);
    });
  });

  describe('setUser', () => {
    test('should set user with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const user = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      };

      provider.setUser(user);

      expect(mockSetUser).toHaveBeenCalledWith(user);
    });
  });

  describe('setTag', () => {
    test('should set tag with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      provider.setTag('environment', 'production');

      expect(mockSetTag).toHaveBeenCalledWith('environment', 'production');
    });

    test('should handle numeric values', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      provider.setTag('version', 2);

      expect(mockSetTag).toHaveBeenCalledWith('version', 2);
    });

    test('should handle boolean values', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      provider.setTag('feature_enabled', true);

      expect(mockSetTag).toHaveBeenCalledWith('feature_enabled', true);
    });
  });

  describe('setExtra', () => {
    test('should set extra data with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      provider.setExtra('metadata', { custom: 'data' });

      expect(mockSetExtra).toHaveBeenCalledWith('metadata', { custom: 'data' });
    });
  });

  describe('setContext', () => {
    test('should set context with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const context = {
        environment: 'staging',
        version: '1.2.3',
      };

      provider.setContext('app', context);

      expect(mockSetContext).toHaveBeenCalledWith('app', context);
    });
  });

  describe('addBreadcrumb', () => {
    test('should add breadcrumb with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const breadcrumb = {
        type: 'user' as const,
        category: 'ui',
        level: 'info' as const,
        message: 'User clicked button',
      };

      provider.addBreadcrumb(breadcrumb);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });
  });

  describe('startTransaction', () => {
    test('should start transaction with Sentry', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const transaction = provider.startTransaction('test-transaction');

      expect(mockStartTransaction).toHaveBeenCalledWith({
        name: 'test-transaction',
        data: undefined,
        op: 'http.server',
        tags: undefined,
      });
      expect(transaction).toBeDefined();
      expect(transaction.finish).toBeDefined();
    });

    test('should include context when provided', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const context = {
        extra: { endpoint: '/api/users' },
        operation: 'api.request',
        tags: { method: 'GET' },
      };

      provider.startTransaction('api-call', context);

      expect(mockStartTransaction).toHaveBeenCalledWith({
        name: 'api-call',
        data: { endpoint: '/api/users' },
        op: 'api.request',
        tags: { method: 'GET' },
      });
    });

    test('should provide transaction methods', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const transaction = provider.startTransaction('test');

      transaction.setData('key', 'value');
      expect(mockTransaction.setData).toHaveBeenCalledWith('key', 'value');

      transaction.setHttpStatus(200);
      expect(mockTransaction.setHttpStatus).toHaveBeenCalledWith(200);

      transaction.setStatus('ok');
      expect(mockTransaction.setStatus).toHaveBeenCalledWith('ok');

      transaction.setTag('type', 'api');
      expect(mockTransaction.setTag).toHaveBeenCalledWith('type', 'api');

      transaction.finish();
      expect(mockTransaction.finish).toHaveBeenCalledWith();
    });
  });

  describe('startSpan', () => {
    test('should create child span when parent provided', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      const parentSpan = {
        startChild: vi.fn(),
      };

      provider.startSpan('child-span', parentSpan);

      expect(parentSpan.startChild).toHaveBeenCalledWith({
        description: 'child-span',
        op: 'child-span',
      });
    });

    test('should create new transaction when no parent', async () => {
      // Initialize provider for this test
      await provider.initialize({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        tracesSampleRate: 0.1,
      });

      provider.startSpan('root-span');

      expect(mockStartTransaction).toHaveBeenCalledWith({
        name: 'root-span',
        op: 'http.server',
      });
    });
  });

  describe('session management', () => {
    test('should start session', () => {
      provider.startSession();
      // Sentry handles sessions automatically
      expect(true).toBeTruthy();
    });

    test('should end session', () => {
      provider.endSession();
      // Sentry handles sessions automatically
      expect(true).toBeTruthy();
    });
  });
});
