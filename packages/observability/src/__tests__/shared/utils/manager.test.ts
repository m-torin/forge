/**
 * Observability Manager tests
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('ObservabilityManager', () => {
  let config: ObservabilityConfig;
  let providerRegistry: ProviderRegistry;
  let manager: ObservabilityManager;

  const originalConsole = console;

  beforeEach(() => {
    // Mock console to avoid noise in tests
    console.error = vi.fn();
    console.log = vi.fn();

    // Clear mock provider calls
    vi.clearAllMocks();

    // Reset mock implementations to defaults
    (mockProvider.initialize as any).mockResolvedValue(undefined);
    (mockProvider2.initialize as any).mockResolvedValue(undefined);

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
    it('should initialize all configured providers', async () => {
      await manager.initialize();

      expect(providerRegistry['mock-provider-1']).toHaveBeenCalledWith({ apiKey: 'key1' });
      expect(providerRegistry['mock-provider-2']).toHaveBeenCalledWith({ apiKey: 'key2' });
      expect(mockProvider.initialize).toHaveBeenCalledWith({ apiKey: 'key1' });
      expect(mockProvider2.initialize).toHaveBeenCalledWith({ apiKey: 'key2' });
    });

    it('should not initialize twice', async () => {
      await manager.initialize();
      await manager.initialize();

      expect(mockProvider.initialize).toHaveBeenCalledTimes(1);
      expect(mockProvider2.initialize).toHaveBeenCalledTimes(1);
    });

    it('should handle provider initialization errors', async () => {
      (mockProvider.initialize as any).mockRejectedValue(new Error('Init failed'));

      await manager.initialize();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'initialize',
      });
      expect(mockProvider2.initialize).toHaveBeenCalled(); // Other providers should still initialize
    });

    it('should handle missing providers gracefully', async () => {
      config.providers['non-existent-provider'] = { apiKey: 'key3' };

      await manager.initialize();

      expect(mockProvider.initialize).toHaveBeenCalled();
      expect(mockProvider2.initialize).toHaveBeenCalled();
      // Should not throw error for missing provider
    });

    it('should log debug info when debug is enabled', async () => {
      config.debug = true;

      await manager.initialize();

      expect(config.onInfo).toHaveBeenCalledWith(
        'Observability initialized with providers: mock-provider-1, mock-provider-2',
      );
    });

    it('should handle provider creation errors', async () => {
      providerRegistry['mock-provider-1'] = vi.fn().mockImplementation(() => {
        throw new Error('Provider creation failed');
      });

      await manager.initialize();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'create',
      });
      expect(mockProvider2.initialize).toHaveBeenCalled(); // Other providers should still work
    });
  });

  describe('exception handling', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should capture exceptions in all providers', async () => {
      const error = new Error('Test error');
      const context = { userId: '123' };

      await manager.captureException(error, context);

      expect(mockProvider.captureException).toHaveBeenCalledWith(error, context);
      expect(mockProvider2.captureException).toHaveBeenCalledWith(error, context);
    });

    it('should handle provider errors during exception capture', async () => {
      const error = new Error('Test error');
      (mockProvider.captureException as any).mockRejectedValue(new Error('Provider failed'));

      await manager.captureException(error);

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        method: 'executeWithCircuitBreaker',
        provider: 'mock-provider-1',
        circuitBreakerState: 'CLOSED',
      });
      expect(mockProvider2.captureException).toHaveBeenCalled(); // Other providers should still work
    });
  });

  describe('message capture', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should capture messages in all providers', async () => {
      const message = 'Test message';
      const level = 'error';
      const context = { feature: 'test' };

      await manager.captureMessage(message, level, context);

      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, level, context);
      expect(mockProvider2.captureMessage).toHaveBeenCalledWith(message, level, context);
    });

    it('should handle provider errors during message capture', async () => {
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

    it('should log to providers that support logging', async () => {
      const level = 'info';
      const message = 'Test log';
      const metadata = { requestId: 'req-123' };

      await manager.log(level, message, metadata);

      expect(mockProvider.log).toHaveBeenCalledWith(level, message, metadata);
      // mockProvider2 doesn't have log method, so it should be skipped
    });

    it('should handle logging errors gracefully', async () => {
      if (mockProvider.log) {
        (mockProvider.log as any).mockRejectedValue(new Error('Log failed'));
      }

      await manager.log('error', 'Test message');

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        method: 'executeWithCircuitBreaker',
        provider: 'mock-provider-1',
        circuitBreakerState: 'CLOSED',
      });
    });
  });

  describe('transactions and spans', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should start transactions in providers that support them', () => {
      const name = 'test-transaction';
      const context = { feature: 'test' };

      const result = manager.startTransaction(name, context);

      expect(mockProvider.startTransaction).toHaveBeenCalledWith(name, context);
      expect(mockProvider2.startTransaction).toHaveBeenCalledWith(name, context);
      expect(result).toEqual([{ id: 'txn-1' }, { id: 'txn-2' }]);
    });

    it('should start spans in providers that support them', () => {
      const name = 'test-span';
      const parentSpan = { id: 'parent-span' };

      const result = manager.startSpan(name, parentSpan);

      expect(mockProvider.startSpan).toHaveBeenCalledWith(name, parentSpan);
      expect(mockProvider2.startSpan).toHaveBeenCalledWith(name, parentSpan);
      expect(result).toEqual([{ id: 'span-1' }, { id: 'span-2' }]);
    });

    it('should handle transaction errors gracefully', () => {
      if (mockProvider.startTransaction) {
        (mockProvider.startTransaction as any).mockImplementation(() => {
          throw new Error('Transaction failed');
        });
      }

      const result = manager.startTransaction('test-transaction');

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        name: 'test-transaction',
        method: 'startTransaction',
      });
      // mockProvider2 still works, so result should contain its transaction
      expect(result).toEqual([{ id: 'txn-2' }]);
    });

    it('should return null when no providers support transactions', () => {
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

    it('should set user on all providers', () => {
      const user = { id: 'user-123', email: 'test@example.com' };

      manager.setUser(user);

      expect(mockProvider.setUser).toHaveBeenCalledWith(user);
      expect(mockProvider2.setUser).toHaveBeenCalledWith(user);
    });

    it('should set tags on all providers', () => {
      const key = 'environment';
      const value = 'production';

      manager.setTag(key, value);

      expect(mockProvider.setTag).toHaveBeenCalledWith(key, value);
      expect(mockProvider2.setTag).toHaveBeenCalledWith(key, value);
    });

    it('should set extras on all providers', () => {
      const key = 'requestData';
      const value = { url: '/api/test', method: 'POST' };

      manager.setExtra(key, value);

      expect(mockProvider.setExtra).toHaveBeenCalledWith(key, value);
      expect(mockProvider2.setExtra).toHaveBeenCalledWith(key, value);
    });

    it('should set context on all providers', () => {
      const key = 'request';
      const context = { id: 'req-123', method: 'GET' };

      manager.setContext(key, context);

      expect(mockProvider.setContext).toHaveBeenCalledWith(key, context);
      expect(mockProvider2.setContext).toHaveBeenCalledWith(key, context);
    });

    it('should handle context setting errors gracefully', () => {
      if (mockProvider.setUser) {
        (mockProvider.setUser as any).mockImplementation(() => {
          throw new Error('setUser failed');
        });
      }

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

    it('should add breadcrumbs to all providers', () => {
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

    it('should preserve existing timestamp in breadcrumbs', () => {
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

    it('should handle breadcrumb errors gracefully', () => {
      if (mockProvider.addBreadcrumb) {
        (mockProvider.addBreadcrumb as any).mockImplementation(() => {
          throw new Error('Breadcrumb failed');
        });
      }

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

    it('should start sessions on providers that support it', () => {
      manager.startSession();

      expect(mockProvider.startSession).toHaveBeenCalled();
      // mockProvider2 doesn't have startSession method
    });

    it('should end sessions on providers that support it', () => {
      manager.endSession();

      expect(mockProvider.endSession).toHaveBeenCalled();
      // mockProvider2 doesn't have endSession method
    });

    it('should handle session errors gracefully', () => {
      if (mockProvider.startSession) {
        (mockProvider.startSession as any).mockImplementation(() => {
          throw new Error('Session start failed');
        });
      }

      manager.startSession();

      expect(config.onError).toHaveBeenCalledWith(expect.any(Error), {
        provider: 'mock-provider-1',
        method: 'startSession',
      });
    });
  });

  describe('context synchronization during initialization', () => {
    it('should sync context to providers after initialization', async () => {
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
    it('should create a new ObservabilityManager instance', () => {
      const manager = createObservabilityManager(config, providerRegistry);

      expect(manager).toBeInstanceOf(ObservabilityManager);
    });
  });
});
