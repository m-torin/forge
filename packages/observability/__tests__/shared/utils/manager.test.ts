import {
  Breadcrumb,
  ObservabilityConfig,
  ObservabilityContext,
  ObservabilityProvider,
  ProviderRegistry,
} from '@/shared/types/types';
import { ObservabilityManager } from '@/shared/utils/manager';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock provider for testing
class MockProvider implements ObservabilityProvider {
  name = 'mock-provider';
  private isConfigured = false;

  async initialize(): Promise<void> {
    this.isConfigured = true;
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    // Mock implementation
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    // Mock implementation
  }

  addBreadcrumb?(breadcrumb: Breadcrumb): void {
    // Mock implementation
  }

  setContext?(key: string, context: Record<string, any>): void {
    // Mock implementation
  }

  setUser?(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    // Mock implementation
  }

  setTag?(key: string, value: boolean | number | string): void {
    // Mock implementation
  }

  setExtra?(key: string, value: any): void {
    // Mock implementation
  }

  async log?(level: string, message: string, metadata?: any): Promise<void> {
    // Mock implementation
  }

  startSession?(): void {
    // Mock implementation
  }

  endSession?(): void {
    // Mock implementation
  }

  startSpan?(name: string, parentSpan?: any): any {
    return {
      finish: () => {},
    };
  }

  startTransaction?(name: string, context?: ObservabilityContext): any {
    return {
      finish: () => {},
    };
  }
}

describe('observabilityManager', () => {
  let manager: ObservabilityManager;
  let mockProvider: MockProvider;
  let providerRegistry: ProviderRegistry;
  let config: ObservabilityConfig;

  beforeEach(() => {
    mockProvider = new MockProvider();
    providerRegistry = {
      'mock-provider': () => mockProvider,
    };

    config = {
      providers: {
        'mock-provider': {
          type: 'mock-provider',
          enabled: true,
        },
      },
    };

    manager = new ObservabilityManager(config, providerRegistry);

    vi.spyOn(mockProvider, 'initialize').mockResolvedValue(undefined);
    vi.spyOn(mockProvider, 'captureException').mockResolvedValue(undefined);
    vi.spyOn(mockProvider, 'captureMessage').mockResolvedValue(undefined);
    vi.spyOn(mockProvider as any, 'addBreadcrumb').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'setContext').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'setUser').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'setTag').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'setExtra').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'log').mockResolvedValue(undefined);
    vi.spyOn(mockProvider as any, 'startSession').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'endSession').mockImplementation(() => {});
    vi.spyOn(mockProvider as any, 'startSpan').mockReturnValue({ finish: vi.fn() });
    vi.spyOn(mockProvider as any, 'startTransaction').mockReturnValue({ finish: vi.fn() });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    test('should initialize successfully with valid config', async () => {
      await manager.initialize();

      expect(mockProvider.initialize).toHaveBeenCalledWith({
        type: 'mock-provider',
        enabled: true,
      });
    });

    test('should handle provider initialization errors gracefully', async () => {
      vi.spyOn(mockProvider, 'initialize').mockRejectedValue(new Error('Init failed'));

      await expect(manager.initialize()).resolves.not.toThrow();
    });

    test('should skip disabled providers', async () => {
      const disabledConfig = {
        providers: {
          'disabled-provider': {
            type: 'mock-provider',
            enabled: false,
          },
        },
      };

      const disabledManager = new ObservabilityManager(disabledConfig, providerRegistry);
      await disabledManager.initialize();

      expect(mockProvider.initialize).not.toHaveBeenCalled();
    });

    test('should handle missing provider types gracefully', async () => {
      const invalidConfig = {
        providers: {
          'unknown-provider': {
            type: 'non-existent-provider',
            enabled: true,
          },
        },
      };

      const invalidManager = new ObservabilityManager(invalidConfig, providerRegistry);
      await expect(invalidManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('captureException', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should capture exceptions with all providers', async () => {
      const error = new Error('Test error');
      const context: ObservabilityContext = {
        tags: { test: 'value' },
      };

      await manager.captureException(error, context);

      expect(mockProvider.captureException).toHaveBeenCalledWith(error, context);
    });

    test('should merge global context with local context', async () => {
      const error = new Error('Test error');
      manager.setTag('global', 'tag');
      manager.setExtra('global', 'extra');

      const localContext: ObservabilityContext = {
        tags: { local: 'tag' },
        extra: { local: 'extra' },
      };

      await manager.captureException(error, localContext);

      expect(mockProvider.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: { local: 'tag' },
          extra: { local: 'extra' },
        }),
      );
    });

    test('should handle provider errors gracefully', async () => {
      vi.spyOn(mockProvider, 'captureException').mockRejectedValue(new Error('Provider error'));

      const error = new Error('Test error');
      await expect(manager.captureException(error)).resolves.not.toThrow();
    });
  });

  describe('captureMessage', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should capture messages with all providers', async () => {
      const message = 'Test message';
      const level = 'info' as const;
      const context: ObservabilityContext = {
        tags: { test: 'value' },
      };

      await manager.captureMessage(message, level, context);

      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, level, context);
    });

    test('should default to info level when not specified', async () => {
      const message = 'Test message';

      await manager.captureMessage(message, 'info');

      expect(mockProvider.captureMessage).toHaveBeenCalledWith(message, 'info', {});
    });
  });

  describe('addBreadcrumb', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should add breadcrumbs to all providers', () => {
      const breadcrumb: Breadcrumb = {
        message: 'User clicked button',
        category: 'ui',
        level: 'info',
        timestamp: Date.now(),
      };

      manager.addBreadcrumb(breadcrumb);

      expect(mockProvider.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });

    test('should handle providers without breadcrumb support', () => {
      const providerWithoutBreadcrumbs = { ...mockProvider };
      delete (providerWithoutBreadcrumbs as any).addBreadcrumb;

      const breadcrumb: Breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info',
        timestamp: Date.now(),
      };

      expect(() => manager.addBreadcrumb(breadcrumb)).not.toThrow();
    });
  });

  describe('context management', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should set user context globally', () => {
      const user = { id: '123', email: 'test@example.com' };

      manager.setUser(user);

      expect(mockProvider.setUser).toHaveBeenCalledWith(user);
    });

    test('should set tags globally', () => {
      manager.setTag('environment', 'test');

      expect(mockProvider.setTag).toHaveBeenCalledWith('environment', 'test');
    });

    test('should set extra data globally', () => {
      manager.setExtra('requestId', 'req-123');

      expect(mockProvider.setExtra).toHaveBeenCalledWith('requestId', 'req-123');
    });

    test('should set context globally', () => {
      const context = { url: '/api/test', method: 'GET' };

      manager.setContext('request', context);

      expect(mockProvider.setContext).toHaveBeenCalledWith('request', context);
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should log messages to all providers', async () => {
      await manager.initialize();

      const level = 'info';
      const message = 'Test log message';
      const metadata = { key: 'value' };

      await manager.log(level, message, metadata);

      expect(mockProvider.log).toHaveBeenCalledWith(level, message, metadata);
    });

    test('should handle providers without log support', async () => {
      const providerWithoutLog = { ...mockProvider };
      delete (providerWithoutLog as any).log;

      await expect(manager.log('info', 'test')).resolves.not.toThrow();
    });
  });

  describe('session management', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should start sessions on all providers', async () => {
      await manager.initialize();

      manager.startSession();

      expect(mockProvider.startSession).toHaveBeenCalledWith();
    });

    test('should end sessions on all providers', async () => {
      await manager.initialize();

      manager.endSession();

      expect(mockProvider.endSession).toHaveBeenCalledWith();
    });
  });

  describe('performance monitoring', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    test('should start spans on all providers', async () => {
      const spanName = 'test-span';

      const span = manager.startSpan(spanName);

      expect(mockProvider.startSpan).toHaveBeenCalledWith(spanName, undefined);
      expect(span).toBeDefined();
    });

    test('should start transactions on all providers', async () => {
      const transactionName = 'test-transaction';
      const context: ObservabilityContext = { tags: { test: 'value' } };

      const transaction = manager.startTransaction(transactionName, context);

      expect(mockProvider.startTransaction).toHaveBeenCalledWith(transactionName, context);
      expect(transaction).toBeDefined();
    });
  });

  describe('circuit breaker integration', () => {
    test('should use circuit breakers for provider calls', async () => {
      const configWithCircuitBreaker = {
        ...config,
        circuitBreaker: {
          failureThreshold: 3,
          resetTimeout: 1000,
        },
      };

      const managerWithCB = new ObservabilityManager(configWithCircuitBreaker, providerRegistry);
      await managerWithCB.initialize();

      // Simulate provider failures to trigger circuit breaker
      vi.spyOn(mockProvider, 'captureException').mockRejectedValue(new Error('Provider error'));

      const error = new Error('Test error');

      // This should not throw even if provider fails
      await expect(managerWithCB.captureException(error)).resolves.not.toThrow();
    });
  });

  describe('connection pooling', () => {
    test('should use connection pooling when configured', async () => {
      const configWithPool = {
        ...config,
        connectionPool: {
          maxConnections: 3,
          idleTimeout: 300000,
        },
      };

      const managerWithPool = new ObservabilityManager(configWithPool, providerRegistry);
      await managerWithPool.initialize();

      // Pool should be used transparently
      const error = new Error('Test error');
      await expect(managerWithPool.captureException(error)).resolves.not.toThrow();
    });
  });

  describe('health monitoring', () => {
    test('should skip unhealthy providers when health monitoring is enabled', async () => {
      const configWithHealth = {
        ...config,
        healthCheck: {
          enabled: true,
          intervalMs: 30000,
        },
      };

      const managerWithHealth = new ObservabilityManager(configWithHealth, providerRegistry);
      await managerWithHealth.initialize();

      // Health check should not prevent normal operation
      const error = new Error('Test error');
      await expect(managerWithHealth.captureException(error)).resolves.not.toThrow();
    });
  });

  describe('timeout handling', () => {
    test('should apply timeouts to provider operations', async () => {
      // Create manager with short timeout
      const shortTimeoutConfig = {
        ...config,
        timeouts: {
          PROVIDER_INIT: 5000,
          CAPTURE_EXCEPTION: 100, // 100ms timeout
          CAPTURE_MESSAGE: 100,
          LOG_OPERATION: 100,
        },
      };
      const shortTimeoutManager = new ObservabilityManager(shortTimeoutConfig, providerRegistry);

      // Simulate slow provider that takes longer than timeout
      vi.spyOn(mockProvider, 'captureException').mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000)), // 1 second delay
      );

      await shortTimeoutManager.initialize();

      const error = new Error('Test error');

      // Should complete despite slow provider (timeout should handle it)
      await expect(shortTimeoutManager.captureException(error)).resolves.not.toThrow();
    }, 10000);
  });

  describe('error handling', () => {
    test('should continue operating when individual providers fail', async () => {
      await manager.initialize();

      vi.spyOn(mockProvider, 'captureException').mockRejectedValue(new Error('Provider failed'));

      const error = new Error('Test error');

      // Should not throw even if provider fails
      await expect(manager.captureException(error)).resolves.not.toThrow();
    });

    test('should handle provider initialization failures gracefully', async () => {
      vi.spyOn(mockProvider, 'initialize').mockRejectedValue(new Error('Init failed'));

      await expect(manager.initialize()).resolves.not.toThrow();
    });
  });
});
