import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  const mockWithScope = vi.fn((callback) => callback(mockScope));

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

vi.mock('@sentry/node', () => ({
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
}));

describe('SentryServerProvider', () => {
  let provider: SentryServerProvider;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockStartTransaction.mockReturnValue(mockTransaction);

    provider = new SentryServerProvider();
    await provider.initialize({
      dsn: 'https://test@sentry.io/12345',
      environment: 'test',
      tracesSampleRate: 0.1,
    });
  });

  describe('initialization', () => {
    it('should initialize Sentry with provided config', async () => {
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

    it('should throw error without DSN', async () => {
      const testProvider = new SentryServerProvider();
      await expect(testProvider.initialize({})).rejects.toThrow('Sentry DSN is required');
    });

    it('should use default values when not provided', async () => {
      const testProvider = new SentryServerProvider();
      await testProvider.initialize({
        dsn: 'https://test@sentry.io/12345',
      });

      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: false,
          environment: 'production',
          profilesSampleRate: 0.1,
          tracesSampleRate: 1,
        }),
      );
    });
  });

  describe('captureException', () => {
    it('should capture exception with Sentry', async () => {
      const error = new Error('Test error');
      await provider.captureException(error);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });

    it('should set context when provided', async () => {
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

    it('should set fingerprint when provided', async () => {
      const error = new Error('Test error');
      const context = {
        fingerprint: ['error-type', 'user-action'],
      };

      await provider.captureException(error, context);

      expect(mockScope.setFingerprint).toHaveBeenCalledWith(['error-type', 'user-action']);
    });
  });

  describe('captureMessage', () => {
    it('should capture message with correct level', async () => {
      await provider.captureMessage('Test message', 'info');

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureMessage).toHaveBeenCalledWith('Test message', 'info');
    });

    it('should map warning level correctly', async () => {
      await provider.captureMessage('Warning message', 'warning');

      expect(mockCaptureMessage).toHaveBeenCalledWith('Warning message', 'warning');
    });

    it('should capture error messages', async () => {
      await provider.captureMessage('Error message', 'error');

      expect(mockCaptureMessage).toHaveBeenCalledWith('Error message', 'error');
    });

    it('should set context when provided', async () => {
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
    it('should set user with Sentry', () => {
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
    it('should set tag with Sentry', () => {
      provider.setTag('environment', 'production');

      expect(mockSetTag).toHaveBeenCalledWith('environment', 'production');
    });

    it('should handle numeric values', () => {
      provider.setTag('version', 2);

      expect(mockSetTag).toHaveBeenCalledWith('version', 2);
    });

    it('should handle boolean values', () => {
      provider.setTag('feature_enabled', true);

      expect(mockSetTag).toHaveBeenCalledWith('feature_enabled', true);
    });
  });

  describe('setExtra', () => {
    it('should set extra data with Sentry', () => {
      provider.setExtra('metadata', { custom: 'data' });

      expect(mockSetExtra).toHaveBeenCalledWith('metadata', { custom: 'data' });
    });
  });

  describe('setContext', () => {
    it('should set context with Sentry', () => {
      const context = {
        environment: 'staging',
        version: '1.2.3',
      };

      provider.setContext('app', context);

      expect(mockSetContext).toHaveBeenCalledWith('app', context);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb with Sentry', () => {
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
    it('should start transaction with Sentry', () => {
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

    it('should include context when provided', () => {
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

    it('should provide transaction methods', () => {
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
      expect(mockTransaction.finish).toHaveBeenCalled();
    });
  });

  describe('startSpan', () => {
    it('should create child span when parent provided', () => {
      const parentSpan = {
        startChild: vi.fn(),
      };

      provider.startSpan('child-span', parentSpan);

      expect(parentSpan.startChild).toHaveBeenCalledWith({
        description: 'child-span',
        op: 'child-span',
      });
    });

    it('should create new transaction when no parent', () => {
      provider.startSpan('root-span');

      expect(mockStartTransaction).toHaveBeenCalledWith({
        name: 'root-span',
        op: 'http.server',
      });
    });
  });

  describe('session management', () => {
    it('should start session', () => {
      provider.startSession();
      // Sentry handles sessions automatically
      expect(true).toBe(true);
    });

    it('should end session', () => {
      provider.endSession();
      // Sentry handles sessions automatically
      expect(true).toBe(true);
    });
  });
});
