/**
 * Observability Manager tests
 */

import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityProvider,
  ProviderRegistry,
} from '../../../shared/types/types';
import { createObservabilityManager, ObservabilityManager } from '../../../shared/utils/manager';

// Use vi.hoisted for mock providers
const { mockProvider, mockProvider2 } = vi.hoisted(() => {
  const mockProvider: ObservabilityProvider = {
    name: 'mock-provider-1',
    addBreadcrumb: vi.fn(),
    captureException: vi.fn().mockResolvedValue(undefined),
    captureMessage: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    log: vi.fn().mockResolvedValue(undefined),
    setContext: vi.fn(),
    setExtra: vi.fn(),
    setTag: vi.fn(),
    setUser: vi.fn(),
    startSession: vi.fn(),
    startSpan: vi.fn().mockReturnValue({ id: 'span-1' }),
    startTransaction: vi.fn().mockReturnValue({ id: 'txn-1' }),
  };

  const mockProvider2: ObservabilityProvider = {
    name: 'mock-provider-2',
    addBreadcrumb: vi.fn(),
    captureException: vi.fn().mockResolvedValue(undefined),
    captureMessage: vi.fn().mockResolvedValue(undefined),
    initialize: vi.fn().mockResolvedValue(undefined),
    setContext: vi.fn(),
    setExtra: vi.fn(),
    setTag: vi.fn(),
    setUser: vi.fn(),
    startSpan: vi.fn().mockReturnValue({ id: 'span-2' }),
    startTransaction: vi.fn().mockReturnValue({ id: 'txn-2' }),
    // Note: Missing log, endSession, startSession methods to test partial implementation
  };

  return { mockProvider, mockProvider2 };
});

describe('observabilityManager', () => {
  let config: ObservabilityConfig;
  let providerRegistry: ProviderRegistry;
  let manager: ObservabilityManager;

  const originalConsole = console;

  beforeEach(() => {
    // Mock console to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation();
    vi.spyOn(console, 'log').mockImplementation();

    // Clear mock call history without removing function references
    Object.values(mockProvider).forEach((fn: any) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        fn.mockClear();
      }
    });
    Object.values(mockProvider2).forEach((fn: any) => {
      if (typeof fn === 'function' && 'mockClear' in fn) {
        fn.mockClear();
      }
    });

    // Create mock provider registry
    providerRegistry = {
      'mock-provider-1': vi.fn().mockReturnValue(mockProvider),
      'mock-provider-2': vi.fn().mockReturnValue(mockProvider2),
      'non-existent-provider': vi.fn().mockReturnValue(null),
    };

    // Create config
    config = {
      providers: {
        'mock-provider-1': { apiKey: 'key1' },
        'mock-provider-2': { apiKey: 'key2' },
      },
      debug: false,
      onError: vi.fn(),
      onInfo: vi.fn(),
      healthCheck: {
        enabled: false, // Disable health monitoring in tests
      },
    };

    manager = new ObservabilityManager(config, providerRegistry);
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
  });

  describe('initialization', () => {
    test('should initialize all configured providers', async () => {
      await manager.initialize();

      expect(providerRegistry['mock-provider-1']).toHaveBeenCalledWith({ apiKey: 'key1' });
      expect(providerRegistry['mock-provider-2']).toHaveBeenCalledWith({ apiKey: 'key2' });
      expect(mockProvider.initialize).toHaveBeenCalledWith({ apiKey: 'key1' });
      expect(mockProvider2.initialize).toHaveBeenCalledWith({ apiKey: 'key2' });
    });

    test('should not initialize twice', async () => {
      await manager.initialize();
      await manager.initialize();

      expect(mockProvider.initialize).toHaveBeenCalledTimes(1);
      expect(mockProvider2.initialize).toHaveBeenCalledTimes(1);
    });

    test('should handle provider initialization errors', async () => {
      (mockProvider.initialize as any).mockRejectedValue(new Error('Init failed'));

      await manager.initialize();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'initialize',
      });
      expect(mockProvider2.initialize).toHaveBeenCalledWith({ apiKey: 'key2' }); // Other providers should still initialize
    });

    test('should handle missing providers gracefully', async () => {
      config.providers['non-existent-provider'] = { apiKey: 'key3' };

      await manager.initialize();

      expect(mockProvider.initialize).toHaveBeenCalledWith({ apiKey: 'key1' });
      expect(mockProvider2.initialize).toHaveBeenCalledWith({ apiKey: 'key2' });
      // Should not throw error for missing provider
    });

    test('should log debug info when debug is enabled', async () => {
      config.debug = true;

      await manager.initialize();

      expect(config.onInfo).toHaveBeenCalledWith(
        'Observability initialized with providers: mock-provider-1, mock-provider-2',
      );
    });

    test('should handle provider creation errors', async () => {
      vi.spyOn(providerRegistry, 'mock-provider-1').mockImplementation(() => {
        throw new Error('Provider creation failed');
      });

      await manager.initialize();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'create',
      });
      expect(mockProvider2.initialize).toHaveBeenCalledWith({ apiKey: 'key2' }); // Other providers should still work
    });
  });

  describe('exception handling', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should capture exceptions in all providers', async () => {
      const error = new Error('Test error');
      const context = { userId: '123' };

      await manager.captureException(error, context);

      expect(mockProvider.captureException).toHaveBeenCalledWith(error, context);
      expect(mockProvider2.captureException).toHaveBeenCalledWith(error, context);
    });

    test('should handle provider errors during exception capture', async () => {
      const error = new Error('Test error');
      (mockProvider.captureException as any).mockRejectedValue(new Error('Provider failed'));

      await manager.captureException(error);

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        method: 'executeWithCircuitBreaker',
        provider: 'mock-provider-1',
        circuitBreakerState: 'CLOSED',
      });
      expect(mockProvider2.captureException).toHaveBeenCalledWith(error, {}); // Other providers should still work
    });
  });

  describe('message capture', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should capture messages in all providers', async () => {
      const message = 'Test message';
      const level = 'error';
      const context = { feature: 'test' };

      await manager.captureMessage(message, level, context);

      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, level, context);
      expect(mockProvider2.captureMessage).toHaveBeenCalledWith(message, level, context);
    });

    test('should handle provider errors during message capture', async () => {
      const message = 'Test message';
      const level = 'warning';
      (mockProvider.captureMessage as any).mockRejectedValue(new Error('Provider failed'));

      await manager.captureMessage(message, level);

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        method: 'executeWithCircuitBreaker',
        provider: 'mock-provider-1',
        circuitBreakerState: 'CLOSED',
      });
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should log to providers that support logging', async () => {
      const level = 'info';
      const message = 'Test log';
      const metadata = { requestId: 'req-123' };

      await manager.log(level, message, metadata);

      expect(mockProvider.log).toHaveBeenCalledWith(level, message, metadata);
      // mockProvider2 doesn't have log method, so it should be skipped
    });

    test('should handle logging errors gracefully', async () => {
      (mockProvider.log as any).mockRejectedValue(new Error('Log failed'));

      await manager.log('error', 'Test message');

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        method: 'executeWithCircuitBreaker',
        provider: 'mock-provider-1',
        circuitBreakerState: 'CLOSED',
      });
    });

    test('should capture error logs to error tracking providers', async () => {
      const error = new Error('Test error');
      const message = 'Error occurred';
      const metadata = { userId: 'user-123', error };

      await manager.log('error', message, metadata);

      // Should capture the exception
      expect(mockProvider.captureException).toHaveBeenCalledWith(error, {
        extra: {
          message,
          ...metadata,
        },
        level: 'error',
      });

      // Should also log normally
      expect(mockProvider.log).toHaveBeenCalledWith('error', message, metadata);
    });

    test('should capture error logs when metadata is the error itself', async () => {
      const error = new Error('Test error');
      const message = 'Error occurred';

      await manager.log('error', message, error);

      // Should capture the exception
      expect(mockProvider.captureException).toHaveBeenCalledWith(error, {
        extra: {
          message,
        },
        level: 'error',
      });

      // Should also log normally
      expect(mockProvider.log).toHaveBeenCalledWith('error', message, error);
    });

    test('should capture error message when no Error object is provided', async () => {
      const message = 'Error occurred';
      const metadata = { userId: 'user-123' };

      await manager.log('error', message, metadata);

      // Should capture as message
      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, 'error', {
        extra: metadata,
        level: 'error',
      });

      // Should also log normally
      expect(mockProvider.log).toHaveBeenCalledWith('error', message, metadata);
    });

    test('should capture fatal logs to error tracking providers', async () => {
      const message = 'Fatal error';
      const metadata = { systemCrash: true };

      await manager.log('fatal', message, metadata);

      // Should capture as message
      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, 'error', {
        extra: metadata,
        level: 'fatal',
      });

      // Should also log normally
      expect(mockProvider.log).toHaveBeenCalledWith('fatal', message, metadata);
    });

    test('should not capture non-error logs to error tracking', async () => {
      await manager.log('info', 'Info message', { data: 'test' });
      await manager.log('warn', 'Warning message', { data: 'test' });
      await manager.log('debug', 'Debug message', { data: 'test' });

      // Should not capture exceptions or messages for non-error logs
      expect(mockProvider.captureException).not.toHaveBeenCalled();
      expect(mockProvider.captureMessage).not.toHaveBeenCalled();

      // Should only log normally
      expect(mockProvider.log).toHaveBeenCalledTimes(3);
    });
  });

  describe('transactions and spans', () => {
    beforeEach(async () => {
      // Ensure mock return values are set for transaction/span tests
      (mockProvider.startTransaction as any).mockReturnValue({ id: 'txn-1' });
      (mockProvider.startSpan as any).mockReturnValue({ id: 'span-1' });
      (mockProvider2.startTransaction as any).mockReturnValue({ id: 'txn-2' });
      (mockProvider2.startSpan as any).mockReturnValue({ id: 'span-2' });

      await manager.initialize();
    });

    test('should start transactions in providers that support them', () => {
      const name = 'test-transaction';
      const context = { feature: 'test' };

      const result = manager.startTransaction(name, context);

      expect(mockProvider.startTransaction).toHaveBeenCalledWith(name, context);
      expect(mockProvider2.startTransaction).toHaveBeenCalledWith(name, context);
      expect(result).toStrictEqual([{ id: 'txn-1' }, { id: 'txn-2' }]);
    });

    test('should start spans in providers that support them', () => {
      const name = 'test-span';
      const parentSpan = { id: 'parent-span' };

      const result = manager.startSpan(name, parentSpan);

      expect(mockProvider.startSpan).toHaveBeenCalledWith(name, parentSpan);
      expect(mockProvider2.startSpan).toHaveBeenCalledWith(name, parentSpan);
      expect(result).toStrictEqual([{ id: 'span-1' }, { id: 'span-2' }]);
    });

    test('should handle transaction errors gracefully', () => {
      (mockProvider.startTransaction as any).mockImplementation(() => {
        throw new Error('Transaction failed');
      });

      const result = manager.startTransaction('test-transaction');

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        name: 'test-transaction',
        method: 'startTransaction',
      });
      // mockProvider2 still works, so result should contain its transaction
      expect(result).toStrictEqual([{ id: 'txn-2' }]);
    });

    test('should return null when no providers support transactions', () => {
      delete mockProvider.startTransaction;
      delete mockProvider2.startTransaction;

      const result = manager.startTransaction('test-transaction');

      expect(result).toBeNull();
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should set user on all providers', () => {
      const user = { id: 'user-123', email: 'test@example.com' };

      manager.setUser(user);

      expect(mockProvider.setUser).toHaveBeenCalledWith(user);
      expect(mockProvider2.setUser).toHaveBeenCalledWith(user);
    });

    test('should set tags on all providers', () => {
      const key = 'environment';
      const value = 'production';

      manager.setTag(key, value);

      expect(mockProvider.setTag).toHaveBeenCalledWith(key, value);
      expect(mockProvider2.setTag).toHaveBeenCalledWith(key, value);
    });

    test('should set extras on all providers', () => {
      const key = 'requestData';
      const value = { url: '/api/test', method: 'POST' };

      manager.setExtra(key, value);

      expect(mockProvider.setExtra).toHaveBeenCalledWith(key, value);
      expect(mockProvider2.setExtra).toHaveBeenCalledWith(key, value);
    });

    test('should set context on all providers', () => {
      const key = 'request';
      const context = { id: 'req-123', method: 'GET' };

      manager.setContext(key, context);

      expect(mockProvider.setContext).toHaveBeenCalledWith(key, context);
      expect(mockProvider2.setContext).toHaveBeenCalledWith(key, context);
    });

    test('should handle context setting errors gracefully', () => {
      (mockProvider.setUser as any).mockImplementation(() => {
        throw new Error('setUser failed');
      });

      const user = { id: 'user-123' };
      manager.setUser(user);

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'setUser',
      });
      expect(mockProvider2.setUser).toHaveBeenCalledWith(user); // Other providers should still work
    });
  });

  describe('breadcrumbs', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should add breadcrumbs to all providers', () => {
      const breadcrumb: Breadcrumb = {
        category: 'ui',
        level: 'info',
        message: 'User clicked button',
      };

      manager.addBreadcrumb(breadcrumb);

      expect(mockProvider.addBreadcrumb).toHaveBeenCalledWith({
        ...breadcrumb,
        timestamp: expect.any(Number),
      });
      expect(mockProvider2.addBreadcrumb).toHaveBeenCalledWith({
        ...breadcrumb,
        timestamp: expect.any(Number),
      });
    });

    test('should preserve existing timestamp in breadcrumbs', () => {
      const timestamp = 1234567890;
      const breadcrumb: Breadcrumb = {
        category: 'custom',
        level: 'info',
        message: 'Custom breadcrumb',
        timestamp,
      };

      manager.addBreadcrumb(breadcrumb);

      expect(mockProvider.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });

    test('should handle breadcrumb errors gracefully', () => {
      (mockProvider.addBreadcrumb as any).mockImplementation(() => {
        throw new Error('Breadcrumb failed');
      });

      const breadcrumb: Breadcrumb = {
        category: 'test',
        level: 'info',
        message: 'Test breadcrumb',
      };

      manager.addBreadcrumb(breadcrumb);

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'addBreadcrumb',
      });
    });
  });

  describe('session management', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should start sessions on providers that support it', () => {
      manager.startSession();

      expect(mockProvider.startSession).toHaveBeenCalledWith();
      // mockProvider2 doesn't have startSession method
    });

    test('should end sessions on providers that support it', () => {
      manager.endSession();

      expect(mockProvider.endSession).toHaveBeenCalledWith();
      // mockProvider2 doesn't have endSession method
    });

    test('should handle session errors gracefully', () => {
      (mockProvider.startSession as any).mockImplementation(() => {
        throw new Error('Session start failed');
      });

      manager.startSession();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'startSession',
      });
    });
  });

  describe('context synchronization during initialization', () => {
    test('should sync context to providers after initialization', async () => {
      // Reset mocks to ensure no interference from previous tests
      (mockProvider.setUser as any).mockImplementation(vi.fn());
      (mockProvider.setTag as any).mockImplementation(vi.fn());
      (mockProvider.setExtra as any).mockImplementation(vi.fn());
      (mockProvider.setContext as any).mockImplementation(vi.fn());

      // Set context before initialization
      manager.setUser({ id: 'user-123', email: 'test@example.com' });
      manager.setTag('env', 'test');
      manager.setExtra('buildId', 'build-123');
      manager.setContext('app', { version: '1.0.0' });

      await manager.initialize();

      // Should be called once during sync (not during setX since providers aren't initialized yet)
      expect(mockProvider.setUser).toHaveBeenCalledTimes(1);
      expect(mockProvider.setTag).toHaveBeenCalledTimes(1);
      expect(mockProvider.setExtra).toHaveBeenCalledTimes(1);
      expect(mockProvider.setContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('createObservabilityManager factory', () => {
    test('should create a new ObservabilityManager instance', () => {
      const manager = createObservabilityManager(config, providerRegistry);

      expect(manager).toBeInstanceOf(ObservabilityManager);
    });
  });
});
