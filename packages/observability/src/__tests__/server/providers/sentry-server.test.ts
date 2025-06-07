import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SentryServerProvider } from '../../../server/providers/sentry-server';

import type { LogEntry } from '../../../shared/types/logger-types';

// Mock Sentry Node SDK
const mockSentryInit = vi.fn();
const mockCaptureException = vi.fn();
const mockCaptureMessage = vi.fn();
const mockSetUser = vi.fn();
const mockSetContext = vi.fn();
const mockAddBreadcrumb = vi.fn();
const mockFlush = vi.fn();

vi.mock('@sentry/node', () => ({
  addBreadcrumb: mockAddBreadcrumb,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  flush: mockFlush,
  init: mockSentryInit,
  setContext: mockSetContext,
  setUser: mockSetUser,
  Severity: {
    Debug: 'debug',
    Error: 'error',
    Info: 'info',
    Warning: 'warning',
  },
}));

describe('SentryServerProvider', () => {
  let provider: SentryServerProvider;
  const mockConfig = {
    dsn: 'https://test@sentry.io/12345',
    environment: 'test',
    tracesSampleRate: 0.1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFlush.mockResolvedValue(true);
    provider = new SentryServerProvider(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize Sentry with provided config', () => {
      expect(mockSentryInit).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/12345',
        environment: 'test',
        integrations: expect.any(Array),
        tracesSampleRate: 0.1,
      });
    });

    it('should be enabled with valid DSN', () => {
      expect(provider.isEnabled()).toBe(true);
    });

    it('should be disabled without DSN', () => {
      const disabledProvider = new SentryServerProvider({});
      expect(disabledProvider.isEnabled()).toBe(false);
    });

    it('should add default integrations', () => {
      const initCall = mockSentryInit.mock.calls[0][0];
      expect(initCall.integrations).toBeDefined();
      expect(Array.isArray(initCall.integrations)).toBe(true);
    });
  });

  describe('log', () => {
    it('should add breadcrumb for info level', async () => {
      const entry: LogEntry = {
        level: 'info',
        message: 'Test info message',
        metadata: { userId: '123' },
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        data: { userId: '123' },
        level: 'info',
        message: 'Test info message',
        timestamp: new Date(entry.timestamp).getTime() / 1000,
      });
    });

    it('should add breadcrumb for debug level', async () => {
      const entry: LogEntry = {
        level: 'debug',
        message: 'Test debug',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        level: 'debug',
        message: 'Test debug',
        timestamp: expect.any(Number),
      });
    });

    it('should capture message for warn level', async () => {
      const entry: LogEntry = {
        level: 'warn',
        message: 'Test warning',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(mockCaptureMessage).toHaveBeenCalledWith('Test warning', 'warning');
    });

    it('should capture message for error level', async () => {
      const entry: LogEntry = {
        level: 'error',
        message: 'Test error',
        timestamp: new Date().toISOString(),
      };

      await provider.log(entry);

      expect(mockCaptureMessage).toHaveBeenCalledWith('Test error', 'error');
    });

    it('should not log when disabled', async () => {
      const disabledProvider = new SentryServerProvider({});

      await disabledProvider.log({
        level: 'error',
        message: 'Should not be logged',
        timestamp: new Date().toISOString(),
      });

      expect(mockCaptureMessage).not.toHaveBeenCalled();
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('captureException', () => {
    it('should capture exception with context', async () => {
      const error = new Error('Test exception');
      const context = {
        endpoint: '/api/test',
        userId: '123',
      };

      await provider.captureException(error, context);

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: context,
      });
    });

    it('should capture exception without context', async () => {
      const error = new Error('Test exception');

      await provider.captureException(error);

      expect(mockCaptureException).toHaveBeenCalledWith(error, {});
    });

    it('should handle non-Error objects', async () => {
      const error = { code: 500, message: 'Custom error' };

      await provider.captureException(error as any, { test: true });

      expect(mockCaptureException).toHaveBeenCalledWith(error, {
        extra: { test: true },
      });
    });

    it('should not capture when disabled', async () => {
      const disabledProvider = new SentryServerProvider({});

      await disabledProvider.captureException(new Error('Test'));

      expect(mockCaptureException).not.toHaveBeenCalled();
    });
  });

  describe('identify', () => {
    it('should set user with traits', async () => {
      await provider.identify('user-123', {
        name: 'Test User',
        email: 'test@example.com',
        plan: 'pro',
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user-123',
        username: 'Test User',
        email: 'test@example.com',
        plan: 'pro',
      });
    });

    it('should set user without traits', async () => {
      await provider.identify('user-456');

      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user-456',
      });
    });

    it('should clear user when userId is null', async () => {
      await provider.identify(null as any);

      expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    it('should not identify when disabled', async () => {
      const disabledProvider = new SentryServerProvider({});

      await disabledProvider.identify('user-123');

      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('setContext', () => {
    it('should set Sentry context', async () => {
      const context = {
        environment: 'production',
        feature: 'checkout',
        version: '1.0.0',
      };

      await provider.setContext(context);

      expect(mockSetContext).toHaveBeenCalledWith('extra', context);
    });

    it('should handle empty context', async () => {
      await provider.setContext({});

      expect(mockSetContext).toHaveBeenCalledWith('extra', {});
    });

    it('should not set context when disabled', async () => {
      const disabledProvider = new SentryServerProvider({});

      await disabledProvider.setContext({ test: true });

      expect(mockSetContext).not.toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    it('should flush Sentry with default timeout', async () => {
      await provider.flush();

      expect(mockFlush).toHaveBeenCalledWith(2000);
    });

    it('should flush Sentry with custom timeout', async () => {
      await provider.flush(5000);

      expect(mockFlush).toHaveBeenCalledWith(5000);
    });

    it('should handle flush errors gracefully', async () => {
      mockFlush.mockRejectedValueOnce(new Error('Flush failed'));

      // Should not throw
      await expect(provider.flush()).resolves.toBeUndefined();
    });

    it('should resolve immediately when disabled', async () => {
      const disabledProvider = new SentryServerProvider({});

      await disabledProvider.flush();

      expect(mockFlush).not.toHaveBeenCalled();
    });
  });

  describe('configuration', () => {
    it('should accept custom integrations', () => {
      mockSentryInit.mockClear();

      const customIntegration = { name: 'CustomIntegration' };
      new SentryServerProvider({
        dsn: 'https://test@sentry.io/12345',
        integrations: [customIntegration],
      });

      const initCall = mockSentryInit.mock.calls[0][0];
      expect(initCall.integrations).toContain(customIntegration);
    });

    it('should pass through all config options', () => {
      mockSentryInit.mockClear();

      const fullConfig = {
        attachStacktrace: true,
        beforeSend: (event: any) => event,
        dsn: 'https://test@sentry.io/12345',
        environment: 'staging',
        release: '1.2.3',
        tracesSampleRate: 0.5,
      };

      new SentryServerProvider(fullConfig);

      expect(mockSentryInit).toHaveBeenCalledWith(expect.objectContaining(fullConfig));
    });
  });
});
