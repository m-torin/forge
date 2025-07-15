import { ObservabilityProvider } from '@/shared/types/types';
import { ConnectionPool, ConnectionPoolOptions } from '@/shared/utils/connection-pool';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock provider for testing
class MockProvider implements ObservabilityProvider {
  name = 'mock-provider';

  async initialize(config?: any): Promise<void> {}
  async captureException(error: Error, context?: any): Promise<void> {}
  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: any,
  ): Promise<void> {}
  addBreadcrumb?(breadcrumb?: any): void {}
  setContext?(key: string, context: Record<string, any>): void {}
  setUser?(user: any): void {}
  setTag?(key: string, value: boolean | number | string): void {}
  setExtra?(key: string, value: any): void {}
  startSession?(): void {}
  endSession?(): void {}
  startSpan?(name: string, parentSpan?: any): any {
    return {};
  }
  startTransaction?(name: string, context?: any): any {
    return {};
  }
  log?(level: string, message: string, metadata?: any): Promise<void> {
    return Promise.resolve();
  }
}

describe('connectionPool', () => {
  let pool: ConnectionPool<MockProvider>;
  let mockProviderFactory: () => MockProvider;

  beforeEach(() => {
    vi.useFakeTimers();
    mockProviderFactory = () => new MockProvider();
  });

  afterEach(() => {
    if (pool) {
      pool.close();
    }
    vi.useRealTimers();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      pool = new ConnectionPool();
      expect(pool).toBeDefined();
    });

    test('should initialize with custom options', () => {
      const options: ConnectionPoolOptions = {
        maxConnections: 5,
        idleTimeout: 60000,
        maxLifetime: 120000,
        onConnectionClose: vi.fn(),
      };
      pool = new ConnectionPool(options);
      expect(pool).toBeDefined();
    });
  });

  describe('acquire', () => {
    beforeEach(() => {
      pool = new ConnectionPool({ maxConnections: 2 });
    });

    test('should create new connection when pool is empty', async () => {
      const connection = await pool.acquire('test-provider', mockProviderFactory);

      expect(connection).toBeDefined();
      expect(connection).not.toBeNull();
      expect(connection!.provider).toBeInstanceOf(MockProvider);
      expect(connection!.id).toBeDefined();
      expect(connection!.inUse).toBeTruthy();
      expect(connection!.useCount).toBe(1);
    });

    test('should reuse existing idle connection', async () => {
      // Acquire and release a connection
      const connection1 = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection1).not.toBeNull();
      const connectionId = connection1!.id;
      pool.release(connection1!);

      // Acquire again - should reuse the same connection
      const connection2 = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection2).not.toBeNull();
      expect(connection2!.id).toBe(connectionId);
      expect(connection2!.useCount).toBe(2);
    });

    test('should create new connection if all are in use and under max limit', async () => {
      const connection1 = await pool.acquire('test-provider', mockProviderFactory);
      const connection2 = await pool.acquire('test-provider', mockProviderFactory);

      expect(connection1).not.toBeNull();
      expect(connection2).not.toBeNull();
      expect(connection1!.id).not.toBe(connection2!.id);
      expect(connection1!.inUse).toBeTruthy();
      expect(connection2!.inUse).toBeTruthy();
    });

    test('should return null when at max capacity', async () => {
      // Fill the pool to capacity
      const connection1 = await pool.acquire('test-provider', mockProviderFactory);
      const connection2 = await pool.acquire('test-provider', mockProviderFactory);

      expect(connection1).not.toBeNull();
      expect(connection2).not.toBeNull();

      // Try to acquire a third connection (should return null)
      const connection3 = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection3).toBeNull();
    });

    test('should handle different provider types separately', async () => {
      const connection1 = await pool.acquire('provider-type-1', mockProviderFactory);
      const connection2 = await pool.acquire('provider-type-2', mockProviderFactory);

      expect(connection1).not.toBeNull();
      expect(connection2).not.toBeNull();
      expect(connection1!.id).not.toBe(connection2!.id);
    });
  });

  describe('release', () => {
    beforeEach(() => {
      pool = new ConnectionPool();
    });

    test('should mark connection as not in use', async () => {
      const connection = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection).not.toBeNull();
      expect(connection!.inUse).toBeTruthy();

      pool.release(connection!);

      // Verify connection is no longer in use by acquiring it again
      const connection2 = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection2).not.toBeNull();
      expect(connection2!.id).toBe(connection!.id);
      expect(connection2!.inUse).toBeTruthy();
    });

    test('should update lastUsed timestamp', async () => {
      const connection = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection).not.toBeNull();
      const originalLastUsed = connection!.lastUsed;

      // Advance time slightly
      vi.advanceTimersByTime(1000);

      pool.release(connection!);

      // Acquire again to check if lastUsed was updated
      const connection2 = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection2).not.toBeNull();
      expect(connection2!.lastUsed.getTime()).toBeGreaterThan(originalLastUsed.getTime());
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      pool = new ConnectionPool();
    });

    test('should return correct statistics', async () => {
      // Create some connections
      const connection1 = await pool.acquire('type1', mockProviderFactory);
      const connection2 = await pool.acquire('type2', mockProviderFactory);
      expect(connection1).not.toBeNull();
      expect(connection2).not.toBeNull();
      pool.release(connection1!);

      const stats = pool.getStats();

      expect(stats.totalConnections).toBe(2);
      expect(stats.totalInUse).toBe(1);
      expect(stats.providers).toHaveLength(2);
      expect(stats.providers[0].type).toBe('type1');
      expect(stats.providers[0].total).toBe(1);
      expect(stats.providers[0].inUse).toBe(0);
      expect(stats.providers[0].idle).toBe(1);
    });

    test('should return empty stats for empty pool', () => {
      const stats = pool.getStats();

      expect(stats.totalConnections).toBe(0);
      expect(stats.totalInUse).toBe(0);
      expect(stats.providers).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      pool = new ConnectionPool({
        idleTimeout: 1000,
        maxLifetime: 2000,
        onConnectionClose: vi.fn(),
      });
    });

    test('should remove idle connections after timeout', async () => {
      const connection = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection).not.toBeNull();
      pool.release(connection!);

      // Advance time past idle timeout and trigger cleanup
      vi.advanceTimersByTime(61000); // 1 minute to trigger cleanup interval

      const stats = pool.getStats();
      expect(stats.totalConnections).toBe(0);
    });

    test('should call onConnectionClose callback when cleaning up', async () => {
      const onConnectionClose = vi.fn();
      pool = new ConnectionPool({
        idleTimeout: 1000,
        onConnectionClose,
      });

      const connection = await pool.acquire('test-provider', mockProviderFactory);
      expect(connection).not.toBeNull();
      pool.release(connection!);

      // Advance time past idle timeout and trigger cleanup
      vi.advanceTimersByTime(61000);

      expect(onConnectionClose).toHaveBeenCalledWith(connection!.id, 'idle_timeout');
    });
  });

  describe('close', () => {
    beforeEach(() => {
      pool = new ConnectionPool();
    });

    test('should close all connections and stop cleanup', async () => {
      const connection1 = await pool.acquire('type1', mockProviderFactory);
      const connection2 = await pool.acquire('type2', mockProviderFactory);

      expect(connection1).not.toBeNull();
      expect(connection2).not.toBeNull();

      pool.close();

      const stats = pool.getStats();
      expect(stats.totalConnections).toBe(0);
    });

    test('should not throw when closing empty pool', () => {
      expect(() => pool.close()).not.toThrow();
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      pool = new ConnectionPool();
    });

    test('should handle provider factory errors gracefully', async () => {
      const errorFactory = () => {
        throw new Error('Factory error');
      };

      const connection = await pool.acquire('test-provider', errorFactory);
      expect(connection).toBeNull();
    });

    test('should handle provider close errors gracefully', async () => {
      const errorProvider = {
        ...new MockProvider(),
        close: () => Promise.reject(new Error('Close error')),
      };

      const errorFactory = () => errorProvider as any;
      const connection = await pool.acquire('test-provider', errorFactory);
      expect(connection).not.toBeNull();

      // Should not throw when closing
      expect(() => pool.close()).not.toThrow();
    });
  });
});
